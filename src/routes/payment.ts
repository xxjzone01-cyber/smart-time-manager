import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Env } from '../index'

const paymentRouter = new Hono<{ Bindings: Env }>()

// PayPal API base URL
const PAYPAL_API = 'https://api-m.sandbox.paypal.com' // Use api-m.paypal.com for production

// Get PayPal access token
async function getPayPalToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = btoa(`${clientId}:${clientSecret}`)
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  
  if (!response.ok) {
    throw new Error('Failed to get PayPal token')
  }
  
  const data = await response.json()
  return data.access_token
}

// Create subscription plan
paymentRouter.post('/create-plan', async (c) => {
  const userId = c.get('userId' as never) as number
  
  try {
    const token = await getPayPalToken(c.env.PAYPAL_CLIENT_ID, c.env.PAYPAL_CLIENT_SECRET)
    
    // Create a product
    const productResponse = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Smart Time Manager Pro',
        description: 'Premium task management and time tracking',
        type: 'SERVICE',
        category: 'SOFTWARE'
      })
    })
    
    const product = await productResponse.json()
    
    // Create a subscription plan
    const planResponse = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: product.id,
        name: 'Monthly Pro Plan',
        description: 'Monthly subscription for Smart Time Manager Pro',
        billing_cycles: [
          {
            frequency: { interval_unit: 'MONTH', interval_count: 1 },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: { value: '9.99', currency_code: 'USD' }
            }
          }
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: '0', currency_code: 'USD' },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3
        }
      })
    })
    
    const plan = await planResponse.json()
    
    // Create subscription
    const subscriptionResponse = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plan_id: plan.id,
        application_context: {
          brand_name: 'Smart Time Manager',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: 'https://smart-time-manager.xyz/payment/success',
          cancel_url: 'https://smart-time-manager.xyz/payment/cancel'
        }
      })
    })
    
    const subscription = await subscriptionResponse.json()
    
    // Save subscription to database
    await c.env.DB.prepare(
      `INSERT INTO subscriptions (user_id, paypal_subscription_id, plan_id, status, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(userId, subscription.id, plan.id, subscription.status).run()
    
    return c.json({
      subscriptionId: subscription.id,
      approveUrl: subscription.links.find((l: any) => l.rel === 'approve')?.href
    })
  } catch (error) {
    console.error('PayPal error:', error)
    return c.json({ error: 'Failed to create subscription' }, 500)
  }
})

// Verify subscription
paymentRouter.get('/subscription', async (c) => {
  const userId = c.get('userId' as never) as number
  const db = c.env.DB
  
  const subscription = await db.prepare(
    `SELECT paypal_subscription_id as paypalId, status, created_at as createdAt
     FROM subscriptions WHERE user_id = ? AND status = 'ACTIVE'
     ORDER BY created_at DESC LIMIT 1`
  ).bind(userId).first()
  
  return c.json({
    isPro: !!subscription,
    subscription
  })
})

// PayPal webhook handler
paymentRouter.post('/webhook', async (c) => {
  const body = await c.req.text()
  const headers = c.req.header()
  
  // Verify webhook signature (simplified - should implement full verification)
  // https://developer.paypal.com/api/rest/webhooks/
  
  const event = JSON.parse(body)
  
  if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const subscriptionId = event.resource.id
    
    await c.env.DB.prepare(
      'UPDATE subscriptions SET status = ? WHERE paypal_subscription_id = ?'
    ).bind('ACTIVE', subscriptionId).run()
  }
  
  if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
    const subscriptionId = event.resource.id
    
    await c.env.DB.prepare(
      'UPDATE subscriptions SET status = ? WHERE paypal_subscription_id = ?'
    ).bind('CANCELLED', subscriptionId).run()
  }
  
  return c.json({ received: true })
})

export { paymentRouter }

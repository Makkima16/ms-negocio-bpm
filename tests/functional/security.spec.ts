import { test } from '@japa/runner'

test('public modules endpoint is reachable without a token', async ({ client }) => {
  const response = await client.get('/modulos')
  response.assertStatus(200)
})

test('protected endpoints reject requests without a token', async ({ client }) => {
  const response = await client.get('/payments')
  response.assertStatus(401)
})

test('webhook without a valid signature is rejected', async ({ client }) => {
  const response = await client.post('/api/webhook/epayco').json({ x_ref_payco: '123' })
  response.assertStatus(401)
})

test('alarm automation endpoint requires the shared token', async ({ client }) => {
  const response = await client.get('/alarms/check')
  response.assertStatus(401)
})

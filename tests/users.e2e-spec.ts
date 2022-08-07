import { Main } from '../src/main';
import { boot } from '../src/server';
import request from 'supertest';

let application: Main;

beforeAll(async () => {
	const { app } = await boot
	application = app
})

describe('Users e2e', () => {
	it('Register error - 422', async () => {
		const res = await request(application.app)
			.post('/users/register')
			.send({email: 'smirnov1@gmail.com', password: '1'})
		expect(res.statusCode).toBe(422)
	})

	it('Login user(positive)', async () => {
		const res = await request(application.app)
			.post('/users/login')
			.send({email: 'smirnov1@gmail.com', password: '554301granny'})
		expect(res.body.jwt).not.toBeUndefined()
	})

	it('Login user(negative)', async () => {
		const res = await request(application.app)
			.post('/users/login')
			.send({email: 'smirnov1@gmail.com', password: '12312sdf'})
		expect(res.statusCode).toBe(401)
	})

	it('Info success', async () => {
		const email = 'smirnov1@gmail.com'
		const password = '554301granny'

		const login = await request(application.app)
			.post('/users/login')
			.send({email, password})

		const res = await request(application.app)
			.get('/users/info')
			.set({Authorization: `Bearer ${login.body.jwt}`})
		expect(res.body.email).toBe(email)
	})

	it('Info - error', async () =>  {
		const res = await request(application.app)
			.get('/users/info')
			.set({Authorization: `Bearer gavno`})
		expect(res.statusCode).toBe(401)
	});

})

afterAll(() => {
	application.close();
});

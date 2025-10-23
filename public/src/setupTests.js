// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill TextEncoder and TextDecoder for Jest environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill setImmediate for environments (like jsdom) where it's not available.
// Some libraries (e.g. multer) expect setImmediate to exist when running under Jest's testEnvironment.
if (typeof global.setImmediate === 'undefined') {
	global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

// Ensure tests run without requiring email verification by default
process.env.REQUIRE_EMAIL_VERIFICATION = 'false';

// Mock nodemailer globally to prevent real emails and to assert sendMail calls
jest.mock('nodemailer', () => {
	const sendMailMock = jest.fn().mockResolvedValue(true);
	return {
		createTransport: () => ({
			sendMail: sendMailMock,
		}),
	};
});
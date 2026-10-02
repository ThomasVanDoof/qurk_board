"use client";

import { useState } from "react";

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<main className="flex min-h-screen items-center justify-center bg-sand px-4 py-8">
			<div className="w-full max-w-md">
				<div className="rounded-2xl border border-dark/10 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
					<div className="mb-8 text-center">
						<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-forest text-2xl font-bold text-sand">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="p-2">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12.75 3.25C12.75 2.83579 12.4142 2.5 12 2.5C11.5858 2.5 11.25 2.83579 11.25 3.25V4.5H4.75C3.50736 4.5 2.5 5.50736 2.5 6.75V15C2.5 16.2426 3.50736 17.25 4.75 17.25H7.90742L6.79074 20.507C6.6564 20.8988 6.86514 21.3253 7.25696 21.4597C7.64878 21.594 8.07532 21.3853 8.20966 20.9934L9.49313 17.25H11.25V21.25C11.25 21.6642 11.5858 22 12 22C12.4142 22 12.75 21.6642 12.75 21.25V17.25H14.5073L15.7907 20.9934C15.9251 21.3853 16.3516 21.594 16.7434 21.4597C17.1353 21.3253 17.344 20.8988 17.2097 20.507L16.093 17.25H19.25C20.4926 17.25 21.5 16.2426 21.5 15V6.75C21.5 5.50736 20.4926 4.5 19.25 4.5H12.75V3.25ZM19.25 15.75C19.6642 15.75 20 15.4142 20 15V6.75C20 6.33579 19.6642 6 19.25 6H4.75C4.33579 6 4 6.33579 4 6.75V15C4 15.4142 4.33579 15.75 4.75 15.75H19.25Z" fill="white"/>
                            </svg>
                        </div>
						<h1 className="text-3xl font-semibold tracking-tight text-dark sm:text-4xl">Welcome back</h1>
						<p className="mt-2 text-sm text-forest/75 sm:text-base">Sign in to continue to your account</p>
					</div>
					<form className="space-y-5 flex flex-col gap-4">
						<div>
							<label htmlFor="email" className="mb-2 block text-sm font-medium text-dark" >Email</label>
							<input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="w-full rounded-lg border border-sage bg-sand/40 px-4 py-3 text-dark outline-none transition placeholder:text-forest/50 focus:border-forest focus:ring-2 focus:ring-green/30" />
						</div>
						<div>
							<div className="mb-2 flex items-center justify-between">
								<label htmlFor="password" className="block text-sm font-medium text-dark" >Password</label>
								<a href="#" className="text-sm font-medium text-green transition-colors hover:text-forest" >Forgot password?</a>
							</div>
							<div className="relative">
								<input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-lg border border-sage bg-sand/40 px-4 py-3 pr-12 text-dark outline-none transition placeholder:text-forest/50 focus:border-forest focus:ring-2 focus:ring-green/30" />
								<button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-forest/70 transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green" >
									{showPassword ? (
										<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5" >
											<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 15.338 6.244 18 12 18c1.67 0 3.163-.293 4.465-.78M7.08 7.08A10.45 10.45 0 0 1 12 6c5.756 0 8.774 2.662 10.066 6a10.523 10.523 0 0 1-2.01 3.77M3 3l18 18" />
											<path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
										</svg>
									) : (
										<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-5 w-5" >
											<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 8.22 6.514 6 12 6c5.486 0 8.577 2.22 9.964 5.678.11.274.11.578 0 .852C20.577 15.78 17.486 18 12 18c-5.486 0-8.577-2.22-9.964-5.678Z" />
											<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
										</svg>
									)}
								</button>
							</div>
						</div>
						<button type="submit" className="w-full rounded-lg bg-forest px-4 py-3 text-sm font-semibold tracking-wide text-sand shadow-sm transition-all hover:bg-green hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 active:scale-[0.99]" >Sign in</button>
					</form>
					<p className="mt-7 text-center text-sm text-forest/70">
						Don't have an account?
						<a href="#" className="font-semibold text-green transition-colors hover:text-forest" >Create one</a>
					</p>
				</div>
			</div>
		</main>
	);
}

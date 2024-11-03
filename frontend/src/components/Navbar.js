import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
	const location = useLocation();

	const isLoginPage = location.pathname === "/login";

	return (
		<nav className='bg-cyan-500 from-cyan-500 to-blue-500 text-white shadow-lg'>
			<div className='container mx-auto flex items-center justify-between py-4 px-6'>
				<a
					href='/'
					className='text-3xl font-bold tracking-wide hover:opacity-90'
				>
					MyCompany
				</a>

				<div className='hidden md:flex text-lg'>
					{isLoginPage ? (
						<Link
							to='/register'
							className='mr-6 hover:text-gray-200 transition'
						>
							Register
						</Link>
					) : (
						<Link to='/login' className='mr-6 hover:text-gray-200 transition'>
							Login
						</Link>
					)}
				</div>

				<button
					className='md:hidden text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white'
					aria-label='Toggle menu'
				>
					<svg
						className='h-6 w-6'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						aria-hidden='true'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M4 6h16M4 12h16m-7 6h7'
						/>
					</svg>
				</button>
			</div>
		</nav>
	);
};

export default Navbar;

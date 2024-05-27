import React from 'react'
import { Link } from 'react-router-dom'
import logo from "../../assets/Logo/Logo-Full-Light.png";
import {NavbarLinks} from "../../data/navbar-links";


const Navbar = () => {
  return (
    <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'>
        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
            {/* Image */}
            <Link to="/">
                <img src={logo} width={160} height={42} loading='lazy' />
            </Link>

            {/* Nav Links */}
            <nav>
                <ul className='flex gap-x-6 text-richblack-25'>
                    {
                        NavbarLinks.map( (link,index) => {
                            <li key={index}>
                                {
                                    link.title === "Catalog" ? (<div></div>) : (
                                        <Link></Link>
                                    )
                                }
                            </li>
                        } )
                    }
                </ul>
            </nav>
        </div>
    </div>
  )
}

export default Navbar
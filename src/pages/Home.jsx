import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
        {/* Section 1 */}
        <div className='relative flex mx-auto flex-col w-11/12 items-center text-white justify-between'>
            <Link to={"/signup"}>
                <div className='mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-full'>
                    <div className='flex flex-row '>
                        <p>Become an instructor</p>
                        <FaArrowRight />
                    </div>
                </div>
            </Link>
        </div>
        {/* Section 2 */}
        {/* Section 3 */}
        {/* footer */}
    </div>
  )
}

export default Home
import React from 'react';
import CustomCard from './CustomCard';
import ProBankImage from '../images/ProBank.png';

function Home() {
    return (
        <div className="home full-height d-flex justify-content-center align-items-center">
            <CustomCard>
                <CustomCard.Body className="text-center">
                    <img
                        style={{
                            objectFit: 'contain',
                            maxWidth: '100%',
                            height: 'auto',
                            visibility: ""
                        }}
                        className='ms-2'
                        src={ProBankImage}
                        alt="Pro Bank"
                    />
                    <div>Developed by <a href="https://www.linkedin.com/in/jeanmenta/" rel="noreferrer" target="_blank">Jean Luis Menta Barreto</a></div>
                </CustomCard.Body>
            </CustomCard>
        </div>
    );
}

export default Home;

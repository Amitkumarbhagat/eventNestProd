import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
    return (
        <div className="min-h-[72vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-green-100">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <FaCheckCircle className="text-5xl drop-shadow-sm" />
                </div>
                <span className="inline-flex rounded-full bg-green-50 text-green-700 text-xs font-bold px-3 py-1 mb-4">Payment Success</span>
                <h1 className="text-3xl font-black text-gray-900 mb-3">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-8 text-base">Your ticket has been booked successfully. A confirmation email has been sent to your registered email address.</p>
                <div className="space-y-4">
                    <Link to="/dashboard" className="block w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md">
                        View My Tickets
                    </Link>
                    <Link to="/" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition">
                        Discover More Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;

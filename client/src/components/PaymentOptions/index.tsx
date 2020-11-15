import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js';
import LoadingIndicator from '../LoadingIndicator';
import { useAuth0 } from "@auth0/auth0-react";

const stripeKey = process.env.REACT_APP_STRIPE_KEY || 'pk_test_51HlxYtKetGCMaugX9Mch4TVVV4u5rU6aiuWVlBDb9tMMtlsgyY8BucPLV8v6QwyoUwopTZL0DWbfuhQO60iYCw3K00vXhVRqNx';
const stripePromise = loadStripe(stripeKey);

type Props = {
    paymentSuccessURL: string;
    signupSuccessURL: string;
    cancelURL: string;
}
const PaymentOptions: React.FC<Props> = (props) => {
    const { paymentSuccessURL, signupSuccessURL, cancelURL } = props;
    const [showLoading, setShowLoading] = useState(false);

    const { loginWithRedirect } = useAuth0();

    const redirectToStripe = async () => {
        try {
            setShowLoading(true);
            const stripe = await stripePromise;
            await stripe!.redirectToCheckout({
                lineItems: [{
                    price: 'price_1HlxZIKetGCMaugX9fflJrEW', // Replace with the ID of your price
                    quantity: 1,
                }],
                    mode: 'payment',
                    successUrl: paymentSuccessURL,
                    cancelUrl: cancelURL,
                });
        } catch (err) {
            console.log('Payment err: ', err.message);
        }
    }
    return (
        <div className='paymentContainer flex flex-col items-center'>
            {showLoading && <LoadingIndicator text='Loading checkout'/>}
            <button role="link" className='mx-2 record-button inline bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded text-xs' onClick={redirectToStripe}>
                Download for $1
            </button>
            <p>or</p>
            <button role="link" className='mx-2 record-button inline bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-xs' onClick={() => loginWithRedirect({ redirectUri: signupSuccessURL })}>
                Sign up for 3 free clips
            </button>
        </div>
    )
}

export default PaymentOptions
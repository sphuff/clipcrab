import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js';
import LoadingIndicator from '../LoadingIndicator';
const stripePromise = loadStripe('pk_test_51HlxYtKetGCMaugX9Mch4TVVV4u5rU6aiuWVlBDb9tMMtlsgyY8BucPLV8v6QwyoUwopTZL0DWbfuhQO60iYCw3K00vXhVRqNx');

type Props = {
    successURL: string;
}
const PaymentOptions: React.FC<Props> = (props) => {
    const { successURL } = props;
    const [showLoading, setShowLoading] = useState(false);

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
                    successUrl: successURL,
                    cancelUrl: 'http://localhost:3001/cancel',
                });
        } catch (err) {
            console.log('Payment err: ', err.message);
        }
    }
    return (
        <div className='paymentContainer flex flex-col'>
            {showLoading && <LoadingIndicator text='Loading checkout'/>}
            <button role="link" className='mx-2 record-button inline bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded text-xs' onClick={redirectToStripe}>
                Download for $1
            </button>
        </div>
    )
}

export default PaymentOptions
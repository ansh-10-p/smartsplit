import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { useCallback } from "react";

export const usePayment = () => {
    const { error, isLoading, Razorpay } = useRazorpay();

    const handlePayment = useCallback((amount, description, onSuccess, onFailure) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: Math.round(amount * 100), // Amount in paise
            currency: "INR",
            name: "SmartSplit",
            description: description || "Expense Settlement",
            image: "https://example.com/your_logo", // You can replace this
            handler: (response) => {
                console.log("Payment Successful", response);
                if (onSuccess) onSuccess(response);
            },
            prefill: {
                name: "User Name", // You could fetch this from context if available
                email: "user@example.com",
                contact: "9999999999",
            },
            notes: {
                address: "SmartSplit Corporate Office",
            },
            theme: {
                color: "#9333ea", // Purple-600 to match theme
            },
            modal: {
                ondismiss: () => {
                    if (onFailure) onFailure("Payment Cancelled");
                }
            }
        };

        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
    }, [Razorpay]);

    return { handlePayment, isLoading, error };
};

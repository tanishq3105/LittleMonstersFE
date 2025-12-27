"use client";
import { useSearchParams } from "next/navigation";
import PaymentSuccess from "@/components/success";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const totalPrice = searchParams.get("totalPrice");
  const transactionId = searchParams.get("transactionId");
  const dateTime = searchParams.get("dateTime");
  return (
    <PaymentSuccess
      totalPrice={Number(totalPrice)}
      transactionId={transactionId || ""}
      dateTime={dateTime || ""}
    />
  );
};

export default SuccessPage;

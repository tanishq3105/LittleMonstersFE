"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PaymentSuccess from "@/components/success";
import Loader from "@/components/loader";

function SuccessContent() {
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
}

const SuccessPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;

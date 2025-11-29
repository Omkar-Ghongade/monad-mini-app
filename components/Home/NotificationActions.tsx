import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useFrame } from "@/components/farcaster-provider";
import { MiniAppNotificationDetails } from "@farcaster/miniapp-core";

export function NotificationActions() {
  const { context, actions } = useFrame();
  const [result, setResult] = useState<string | null>(null);
  const [notificationDetails, setNotificationDetails] =
    useState<MiniAppNotificationDetails | null>(null);

  const fid = context?.user?.fid;

  useEffect(() => {
    if (context?.user?.fid) {
      setNotificationDetails(context?.client.notificationDetails ?? null);
    }
  }, [context]);

  const { mutate: sendNotification, isPending: isSendingNotification } =
    useMutation({
      mutationFn: async () => {
        if (!fid) throw new Error("No fid");

        return await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fid,
            notificationDetails,
          }),
        });
      },
      onSuccess: (response) => {
        if (response.status === 200) setResult("Notification sent!");
        else if (response.status === 429)
          setResult("Rate limited. Try again later.");
        else setResult("Error sending notification.");
      },
      onError: () => {
        setResult("Error sending notification.");
      },
    });

  return (
    <div className="border-4 border-black p-6 bg-neo-purple neobrutal-shadow">
      <h2 className="text-2xl font-black text-left mb-4 uppercase">Notifications</h2>
      <div className="flex flex-col space-y-3">
        {notificationDetails ? (
          <button
            type="button"
            className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => sendNotification()}
            disabled={isSendingNotification || !notificationDetails}
          >
            {isSendingNotification ? "Sending..." : "Send Test Notification"}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() => actions?.addMiniApp()}
            >
              Add this Mini App to receive notifications
            </button>
            <p className="text-sm font-bold text-black border-2 border-black bg-neo-red text-white px-3 py-2">
              You must add this Mini App and enable notifications to send a test
              notification.
            </p>
          </>
        )}
        {result && (
          <p className="mt-2 text-base font-bold border-2 border-black bg-neo-yellow px-3 py-2">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}

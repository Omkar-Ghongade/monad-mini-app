import { useFrame } from "@/components/farcaster-provider";
import { APP_URL } from "@/lib/constants";

export default function CustomOGImageAction() {
  const { context, actions } = useFrame();

  const fid = context?.user?.fid;
  const username = context?.user?.username;
  const pfpUrl = context?.user?.pfpUrl;

  const handleGenerateCustomOGImage = () => {
    const ogImageUrl = `${APP_URL}/api/og?username=${username}&image=${pfpUrl}`;
    actions?.composeCast({
      text: "I generated a custom OG image using Monad Mini App template",
      embeds: [ogImageUrl],
    });
  };

  return (
    <div className="border-4 border-black p-6 bg-neo-orange neobrutal-shadow">
      <h2 className="text-2xl font-black text-left mb-4 uppercase">
        Generate Custom Image
      </h2>
      <div className="flex flex-col space-y-3">
        {fid ? (
          <button
            type="button"
            className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleGenerateCustomOGImage()}
            disabled={!fid}
          >
            Generate Custom Image
          </button>
        ) : (
          <p className="text-sm font-bold text-black border-2 border-black bg-neo-red text-white px-3 py-2">
            Please login to generate a custom image
          </p>
        )}
      </div>
    </div>
  );
}

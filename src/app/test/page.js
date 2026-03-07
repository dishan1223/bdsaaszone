"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export default function Text() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // After logging out, send them back to the login page
          router.push("/login");
          // Optional: Refresh to clear any cached user data in the UI
          router.refresh();
        },
      },
    });
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        padding: "8px 16px",
        backgroundColor: "#ff4444",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}
    >
      Log Out
    </button>
  );
}
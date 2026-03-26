import { PublicClientApplication } from "@azure/msal-browser";
import type { OneDriveItem } from "./firestore/types";

let msal: PublicClientApplication | null = null;

export function getMsal() {
  if (msal) return msal;
  msal = new PublicClientApplication({
    auth: {
      clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? "placeholder",
      authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? "common"}`,
      redirectUri: process.env.NEXT_PUBLIC_ONEDRIVE_REDIRECT_URI ?? (typeof window !== "undefined" ? window.location.origin : ""),
    },
    cache: { cacheLocation: "sessionStorage" },
  });
  return msal;
}

export async function getGraphToken(): Promise<string> {
  const m = getMsal();
  await m.initialize();
  const a = m.getAllAccounts(), req = { scopes: ["Files.Read", "Files.Read.All"] };
  try {
    return (a.length > 0 ? await m.acquireTokenSilent({ ...req, account: a[0] }) : await m.acquireTokenPopup(req)).accessToken;
  } catch {
    return (await m.acquireTokenPopup(req)).accessToken;
  }
}

interface Raw { id: string; name: string; webUrl: string; folder?: object; parentReference?: { driveId: string }; }

export function openOneDrivePicker(token: string): Promise<OneDriveItem[]> {
  return new Promise((res, rej) => {
    const opts = {
      clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? "placeholder",
      action: "query",
      multiSelect: true,
      advanced: {
        accessToken: token,
        filter: "folder,.txt,.md,.pdf,.docx",
        redirectUri: typeof window !== "undefined" ? window.location.origin : "",
      },
      success: (f: { value: Raw[] }) => res(f.value.map(x => ({
        id: x.id, name: x.name, webUrl: x.webUrl,
        driveId: x.parentReference?.driveId ?? "",
        itemId: x.id, isFolder: !!x.folder
      }))),
      cancel: () => res([]),
      error: (e: unknown) => rej(e),
    };
    type OD = { open: (o: typeof opts) => void };
    (window as typeof window & { OneDrive: OD }).OneDrive.open(opts);
  });
}

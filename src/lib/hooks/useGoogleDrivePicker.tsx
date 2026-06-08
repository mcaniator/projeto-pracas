import { useHelperCard } from "@/components/context/helperCardContext";
import { useState } from "react";

let googleAccessToken: string | null = null;

const loadScript = ({ elementId, src }: { elementId: string; src: string }) =>
  new Promise<void>((resolve, reject) => {
    if (document.getElementById(elementId)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = elementId;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Error loading ${src}`));
    document.head.appendChild(script);
  });

const loadGooglePickerLibrary = async () => {
  await Promise.all([
    loadScript({
      elementId: "google-api-loader",
      src: "https://apis.google.com/js/api.js",
    }),
    loadScript({
      elementId: "google-identity-services",
      src: "https://accounts.google.com/gsi/client",
    }),
  ]);

  if (!gapi) {
    throw new Error("Google API Loader indisponivel.");
  }

  await new Promise<void>((resolve) => {
    gapi.load("picker", resolve);
  });
};

type OpenGoogleDrivePickerParams = {
  enableUploadView?: boolean;
  enableMultiSelect?: boolean;
  uploadViewParentId?: string;
  pickerCallback?: (result: google.picker.ResponseObject) => void;
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googlePickerApiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
const googleDriveAppId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_APP_ID;

const useGoogleDrivePicker = () => {
  const { setHelperCard } = useHelperCard();
  const [loadingPicker, setLoadingPicker] = useState(false);
  if (!googleClientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined");
  }
  if (!googlePickerApiKey) {
    throw new Error("NEXT_PUBLIC_GOOGLE_PICKER_API_KEY is not defined");
  }
  if (!googleDriveAppId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_DRIVE_APP_ID is not defined");
  }

  const createPicker = async ({
    enableUploadView,
    enableMultiSelect,
    uploadViewParentId,
    pickerCallback,
  }: OpenGoogleDrivePickerParams) => {
    setLoadingPicker(true);
    await loadGooglePickerLibrary();
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: "https://www.googleapis.com/auth/drive.file", //See, edit, create, and delete only the specific Google Drive files you use with this app.
      callback: (response) => {
        if (response.error) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Erro ao conectar ao Google Drive!</>,
          });
          setLoadingPicker(false);
          return;
        }
        // eslint-disable-next-line react-compiler/react-compiler
        googleAccessToken = response.access_token;
        const picker = new google.picker.PickerBuilder()
          .setDeveloperKey(googlePickerApiKey)
          .setAppId(googleDriveAppId)
          .setOAuthToken(googleAccessToken);

        if (pickerCallback) {
          picker.setCallback(pickerCallback);
        }

        if (enableUploadView) {
          const uploadView = new google.picker.DocsUploadView();
          if (uploadViewParentId) {
            uploadView.setParent(uploadViewParentId);
          }
          picker.addView(uploadView);
        }
        if (enableMultiSelect) {
          picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
        }
        picker.build().setVisible(true);
        setLoadingPicker(false);
      },
    });

    if (!googleAccessToken) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: "" });
    }
  };
  return [createPicker, loadingPicker] as const;
};

export default useGoogleDrivePicker;

const firebaseConfig = {
  apiKey: "AIzaSyBOUs1Dynv0-pmd76DjT_9hWKnvEM2xBbE",
  authDomain: "community-image-e6898.firebaseapp.com",
  projectId: "community-image-e6898",
  storageBucket: "community-image-e6898.firebasestorage.app",
  messagingSenderId: "1035102140254",
  appId: "1:1035102140254:web:de63d0bea246ac443681cf",
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

async function uploadImage(file) {
  try {
    const storageRef = storage.ref();
    const savedPath = storageRef.child("image/" + file.name);

    await savedPath.put(file);
    console.log("없로드 완료!");

    const downloadUrl = await savedPath.getDownloadURL();
    console.log(`downloadUrl : ${downloadUrl}`);

    return downloadUrl;
  } catch (error) {
    console.error("업로드 중 오류 발생:", error);
    throw error;
  }
}

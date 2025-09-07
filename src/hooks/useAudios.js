import { useEffect, useState } from "react";
import axios from "axios";

// Tạo instance axios với cấu hình chung
const api = axios.create({
  baseURL: "https://archive.org/metadata",
  timeout: 300000, // 5 phút để chờ Render spin-up
});

// Định nghĩa key lưu trong localStorage
const storageKeys = {
  audios: "audios",
  currentIndex: "currentIndex",
  currentTime: "currentTime",
};

export default function useAudios(username) {
  // State quản lý dữ liệu, trạng thái loading và error
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [init, setInit] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const shuffleAudios = () => {
    const result = shuffleArray(audios);
    // lưu lại
    localStorage.setItem(storageKeys.audios, JSON.stringify(result));
    // set state
    setAudios(result);
  };

  // Hàm gọi API lấy danh sách audios theo username
  const fetchaudios = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API
      const res = await api.get(`/${username}`);

      const data = res.data.files.reduce((acc, f) => {
        if (f.format === "VBR MP3") {
          // lọc
          const newItem = {
            title: cleanTitle(f.name), // biến đổi luôn
            url: `https://${res.data.server}${
              res.data.dir
            }/${encodeURIComponent(removeExtension(f.name))}`,
            mtime: f.mtime, // giữ để sắp xếp
          };

          // Tìm vị trí chèn để sắp xếp giảm dần theo mtime
          let index = acc.findIndex((item) => newItem.mtime > item.mtime);
          if (index === -1) index = acc.length;
          acc.splice(index, 0, newItem);
        }
        return acc;
      }, []);

      // Lưu kết quả vào localStorage để cache
      localStorage.setItem(storageKeys.audios, JSON.stringify(data));

      // Cập nhật state audios
      setAudios(data);
    } catch (err) {
      console.error("API error:", err);
      setError("Không lấy được dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Khi username thay đổi → fetch lại audios
  useEffect(() => {
    if (username && !init) fetchaudios();
  }, [username]);

  // Khi hook mount lần đầu → kiểm tra cache trong localStorage
  useEffect(() => {
    const cachedAudios = JSON.parse(localStorage.getItem(storageKeys.audios));
    const cachedCurrentIndex = JSON.parse(
      localStorage.getItem(storageKeys.currentIndex)
    );
    const cachedCurrentTime = JSON.parse(
      localStorage.getItem(storageKeys.currentTime)
    );

    setCurrentIndex(cachedCurrentIndex ?? 0);
    setCurrentTime(cachedCurrentTime ?? 0);

    if (cachedAudios) {
      // Nếu có cache thì dùng cache trước
      setAudios(cachedAudios);
      setLoading(false);
    } else {
      // Nếu không có cache thì fetch từ API
      fetchaudios();
    }

    setInit(false);
  }, []);

  // Đồng bộ currentIndex với localStorage
  useEffect(() => {
    if (!init)
      localStorage.setItem(storageKeys.currentIndex, Number(currentIndex));
  }, [currentIndex]);

  // Đồng bộ currentTime với localStorage
  useEffect(() => {
    if (!init)
      localStorage.setItem(storageKeys.currentTime, Number(currentTime));
  }, [currentTime]);

  // Trả về dữ liệu và các helper cho component sử dụng
  return {
    init,
    audios,
    loading,
    error,
    currentIndex,
    setCurrentIndex,
    playing,
    setPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    refetch: fetchaudios,
    shuffleAudios,
  };
}

function cleanTitle(title) {
  return title
    .replace(/\.[^/.]+$/, "")
    .normalize("NFKC")
    .split("#")[0]
    .trim();
}

function shuffleArray(array) {
  const result = [...array]; // sao chép mảng để không thay đổi mảng gốc
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // chọn vị trí ngẫu nhiên từ 0 đến i
    [result[i], result[j]] = [result[j], result[i]]; // hoán đổi
  }
  return result;
}

function removeExtension(filename) {
  const index = filename.lastIndexOf(".");
  return index > 0 ? filename.substring(0, index) : filename;
}

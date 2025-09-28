import React, { useState } from "react";
import "./App.css";

const API_KEY = "AIzaSyA2-nX53GEYS8ZKwC6VCe-t2iFD7_VqUTE";

export default function App() {
  const [playlistId, setPlaylistId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [showAdvForm, setShowAdvForm] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ---------- Helpers ----------
  const getId = (link) => {
    const match = link?.match(/^([\S]+list=)?([\w_-]+)[\S]*$/);
    return match ? match[2] : "";
  };

  const convertDurationToSeconds = (duration) => {
    const [, h = 0, m = 0, s = 0] = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
    return +h * 3600 + +m * 60 + +s;
  };

  // ---------- Core ----------
  async function calculateTotalLength(pid, s, e) {
    let totalDuration = 0,
      totalAdvDuration = 0,
      totalVideos = 0,
      count = 0;
    let nextPageToken = "";

    try {
      do {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${pid}&key=${API_KEY}&pageToken=${nextPageToken}`
        );
        if (!res.ok) throw new Error("Invalid playlist");
        const data = await res.json();

        const videoIds = data.items.map((i) => i.contentDetails.videoId);
        if (videoIds.length) {
          const detailsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(
              ","
            )}&key=${API_KEY}`
          );
          if (!detailsRes.ok) throw new Error("Invalid video details");
          const details = await detailsRes.json();

          details.items.forEach((video) => {
            const duration = convertDurationToSeconds(video.contentDetails.duration);
            if (s <= count && count <= e) totalAdvDuration += duration;
            totalDuration += duration;
            count++;
          });
        }

        nextPageToken = data.nextPageToken;
        totalVideos += videoIds.length;
      } while (nextPageToken);

      displayTotalDuration(
        showAdvForm ? totalAdvDuration : totalDuration,
        showAdvForm ? e - s + 1 : totalVideos
      );
    } catch (err) {
      displayError(err.message || "Something went wrong.");
      setLoading(false);
    }
  }

  const displayTotalDuration = (totalSeconds, totalVideos) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setLoading(false);
    setResult({
      videos: totalVideos,
      duration: `${hours} hours, ${minutes} minutes, ${seconds} seconds`,
    });
  };

  const displayError = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 5000);
  };

  // ---------- Events ----------
  const handleSearch = () => {
    if (!playlistId) return displayError("Search field can't be empty.");

    const pid = getId(playlistId);
    if (!pid) return displayError("No videos found. Playlist is empty.");

    setLoading(true);
    setResult(null);

    if (showAdvForm) {
      const s = parseInt(start, 10);
      const e = parseInt(end, 10);
      if (s > 0 && e > 0 && s <= e) {
        calculateTotalLength(pid, s - 1, e - 1);
      } else {
        displayError("Invalid start/end values.");
        setLoading(false);
      }
    } else {
      calculateTotalLength(pid, 0, 0);
    }
  };

  return (
    <div>
      <header>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="yt-ringo2-svg_yt11"
          viewBox="0 0 93 20"
          focusable="false"
          aria-hidden="true"
        >
          <g>
            <path
              d="M14.4848 20C14.4848 20 23.5695 20 25.8229 19.4C27.0917 19.06 28.0459 18.08 28.3808 16.87C29 14.65 29 9.98 29 9.98C29 9.98 29 5.34 28.3808 3.14C28.0459 1.9 27.0917 0.94 25.8229 0.61C23.5695 0 14.4848 0 14.4848 0C14.4848 0 5.42037 0 3.17711 0.61C1.9286 0.94 0.954148 1.9 0.59888 3.14C0 5.34 0 9.98 0 9.98C0 9.98 0 14.65 0.59888 16.87C0.954148 18.08 1.9286 19.06 3.17711 19.4C5.42037 20 14.4848 20 14.4848 20Z"
              fill="#FF0033"
            ></path>
            <path d="M19 10L11.5 5.75V14.25L19 10Z" fill="white"></path>
          </g>
          <g id="youtube-paths_yt11">
            <path d="M37.1384 18.8999V13.4399L40.6084 2.09994H38.0184L36.6984 7.24994C36.3984 8.42994 36.1284 9.65994 35.9284 10.7999H35.7684C35.6584 9.79994 35.3384 8.48994 35.0184 7.22994L33.7384 2.09994H31.1484L34.5684 13.4399V18.8999H37.1384Z"></path>
            <path d="M44.1003 6.29994C41.0703 6.29994 40.0303 8.04994 40.0303 11.8199V13.6099C40.0303 16.9899 40.6803 19.1099 44.0403 19.1099C47.3503 19.1099 48.0603 17.0899 48.0603 13.6099V11.8199C48.0603 8.44994 47.3803 6.29994 44.1003 6.29994ZM45.3903 14.7199C45.3903 16.3599 45.1003 17.3899 44.0503 17.3899C43.0203 17.3899 42.7303 16.3499 42.7303 14.7199V10.6799C42.7303 9.27994 42.9303 8.02994 44.0503 8.02994C45.2303 8.02994 45.3903 9.34994 45.3903 10.6799V14.7199Z"></path>
            <path d="M52.2713 19.0899C53.7313 19.0899 54.6413 18.4799 55.3913 17.3799H55.5013L55.6113 18.8999H57.6012V6.53994H54.9613V16.4699C54.6812 16.9599 54.0312 17.3199 53.4212 17.3199C52.6512 17.3199 52.4113 16.7099 52.4113 15.6899V6.53994H49.7812V15.8099C49.7812 17.8199 50.3613 19.0899 52.2713 19.0899Z"></path>
            <path d="M62.8261 18.8999V4.14994H65.8661V2.09994H57.1761V4.14994H60.2161V18.8999H62.8261Z"></path>
            <path d="M67.8728 19.0899C69.3328 19.0899 70.2428 18.4799 70.9928 17.3799H71.1028L71.2128 18.8999H73.2028V6.53994H70.5628V16.4699C70.2828 16.9599 69.6328 17.3199 69.0228 17.3199C68.2528 17.3199 68.0128 16.7099 68.0128 15.6899V6.53994H65.3828V15.8099C65.3828 17.8199 65.9628 19.0899 67.8728 19.0899Z"></path>
            <path d="M80.6744 6.26994C79.3944 6.26994 78.4744 6.82994 77.8644 7.73994H77.7344C77.8144 6.53994 77.8744 5.51994 77.8744 4.70994V1.43994H75.3244L75.3144 12.1799L75.3244 18.8999H77.5444L77.7344 17.6999H77.8044C78.3944 18.5099 79.3044 19.0199 80.5144 19.0199C82.5244 19.0199 83.3844 17.2899 83.3844 13.6099V11.6999C83.3844 8.25994 82.9944 6.26994 80.6744 6.26994ZM80.7644 13.6099C80.7644 15.9099 80.4244 17.2799 79.3544 17.2799C78.8544 17.2799 78.1644 17.0399 77.8544 16.5899V9.23994C78.1244 8.53994 78.7244 8.02994 79.3944 8.02994C80.4744 8.02994 80.7644 9.33994 80.7644 11.7299V13.6099Z"></path>
            <path d="M92.6517 11.4999C92.6517 8.51994 92.3517 6.30994 88.9217 6.30994C85.6917 6.30994 84.9717 8.45994 84.9717 11.6199V13.7899C84.9717 16.8699 85.6317 19.1099 88.8417 19.1099C91.3817 19.1099 92.6917 17.8399 92.5417 15.3799L90.2917 15.2599C90.2617 16.7799 89.9117 17.3999 88.9017 17.3999C87.6317 17.3999 87.5717 16.1899 87.5717 14.3899V13.5499H92.6517V11.4999ZM88.8617 7.96994C90.0817 7.96994 90.1717 9.11994 90.1717 11.0699V12.0799H87.5717V11.0699C87.5717 9.13994 87.6517 7.96994 88.8617 7.96994Z"></path>
          </g>
        </svg>
        <span>Playlist Length Calculator</span>
      </header>

      <main>
        {/* Toast */}
        <div className="toast" style={{ display: toast ? "flex" : "none" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.99985 0.615356C3.93831 0.615356 0.615234 3.93843 0.615234 7.99997C0.615234 12.0615 3.93831 15.3846 7.99985 15.3846C12.0614 15.3846 15.3845 12.0615 15.3845 7.99997C15.3845 3.93843 12.0614 0.615356 7.99985 0.615356ZM2.46141 7.99995C2.46141 4.95379 4.95372 2.46148 7.99987 2.46148C9.19987 2.46148 10.3076 2.83071 11.1999 3.47687L3.4768 11.1999C2.83064 10.3076 2.46141 9.19995 2.46141 7.99995ZM7.99973 13.5385C6.79973 13.5385 5.69204 13.1692 4.79973 12.5231L12.5228 4.8C13.169 5.69231 13.5382 6.8 13.5382 8C13.5382 11.0462 11.0459 13.5385 7.99973 13.5385Z"
              fill="#A31B00"
            />
          </svg>
          <span>{toast}</span>
        </div>

        {/* Form */}
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            // handleSearch();
          }}
        >
          <div>
            <input
              type="search"
              id="playlistId"
              placeholder="Enter youtube playlist link"
              required
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
            />
            {loading ? (
              <svg
                class="verifying-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fill="#212121"
                  d="M21 12C21 16.9641 16.9641 21 12 21C7.03594 21 3 16.9641 3 12C3 8.04844 5.6434 4.49766 9.43008 3.37266C10.0256 3.19522 10.6518 3.53582 10.8286 4.13027C11.0066 4.72582 10.6671 5.35195 10.0717 5.52949C7.23281 6.37394 5.25 9.03633 5.25 12C5.25 15.723 8.27801 18.75 12 18.75C15.722 18.75 18.75 15.722 18.75 12C18.75 9.03492 16.7679 6.375 13.9301 5.53125C13.3345 5.35382 12.9953 4.72758 13.1732 4.13203C13.35 3.53754 13.9761 3.19828 14.5717 3.37441C18.3562 4.49906 21 8.04844 21 12Z"
                />
              </svg>
            ) : (
              <svg
                onClick={handleSearch}
                class="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  clip-rule="evenodd"
                  d="M16.296 16.996a8 8 0 11.707-.708l3.909 3.91-.707.707-3.909-3.909zM18 11a7 7 0 00-14 0 7 7 0 1014 0z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            )}
          </div>

          {showAdvForm && (
            <div className="adv-form">
              <input
                type="number"
                name="start"
                id="start"
                min="1"
                max="9999"
                placeholder="Enter start video number"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <input
                type="number"
                name="end"
                id="end"
                min="1"
                max="9999"
                placeholder="Enter end video number"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              <span className="close" onClick={() => setShowAdvForm(false)}>
                &#10005;
              </span>
            </div>
          )}

          {!showAdvForm && (
            <button type="button" className="adv-button" onClick={() => setShowAdvForm(true)}>
              Advanced search
            </button>
          )}
        </form>

        {/* Result */}
        <div className="result">
          {loading && <p>Loading...</p>}
          {result && (
            <>
              <div className="videos">
                <span className="title">No. of Videos</span>
                <span className="value">{result.videos}</span>
              </div>
              <div className="duration">
                <span className="title">Total Duration</span>
                <span className="value">{result.duration}</span>
              </div>
            </>
          )}
        </div>
      </main>

      <footer>Arpit Gupta, {new Date().getFullYear()}</footer>
    </div>
  );
}

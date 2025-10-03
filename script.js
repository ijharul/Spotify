console.log("Lets stsart java script");
let currentSong = new Audio();
let songs = [];
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {
    currFolder = folder;
    let newSongs = []; 

    // Get the song list element and clear it immediately
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; 

    
        // Attempt to fetch the directory listing HTML
        let a = await fetch(`${folder}/`);
        
        if (!a.ok) {
            throw new Error(`Failed to fetch directory listing. Status: ${a.status}`);
        }
        
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                // Collect the decoded filename only
                newSongs.push(decodeURIComponent(element.href.split("/").pop()));
            }
        }
        
        
        songs = newSongs;

    for (const song of songs) {
        let decodedSongName = song.replaceAll("%20", " ").replace(".mp3", "");
        songUL.innerHTML +=
            `<li><img class="invert" width="34" src="music.svg" alt="">
                <div class="info">
                    <div>${decodedSongName}</div>
                    <div>Ijharul</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach an event listener to each song
    Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", () => {
            const trackName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log(`Playing: ${trackName}.mp3`);
            playMusic(trackName + ".mp3");
        });
    });
    
    return songs;
}


const playMusic = (track, pause = false) => {
  // currFolder holds the path like "songs/othersong"
  currentSong.src = `songs/${currFolder}/${track}`;

  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  // Clean the track name for display in the play bar
  document.querySelector(".songinfo").innerHTML = decodeURI(track).replaceAll("%20", " ").replace(".mp3", "");
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");
    // cardContainer.innerHTML = ""; // Clear existing cards

    try {
        let a = await fetch(`songs/`);
        let response = await a.text();
        
        
        
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        
        
        for (const e of anchors) {

            let folder = decodeURIComponent(e.href.split("/").slice(-2)[0]);

            const isFile = folder.includes('.'); 
            
            if (
                folder &&
                folder !== "" &&
                folder !== ".." &&
                folder !== "songs" && 
                folder !== "webde" && 
                folder !== "Spotify" && 
                !isFile 
            ) {
                
               
                try {
                    const encodedFolder = encodeURIComponent(folder);
                    let fetchPath = `songs/${encodedFolder}/info.json`;
                    
                    let a_json = await fetch(fetchPath);
                    
                    if (!a_json.ok){
                        console.warn(`Could not load info.json for folder: ${folder}. Status: ${a_json.status}. Skipping.`);
                        continue; 
                    }
                    
                    let response_json = await a_json.json();

                    // Build the card HTML
                    cardContainer.innerHTML +=
                      ` <div data-folder="${folder}" class="card">
                            <div class="play">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                               <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="white" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" fill-rule="evenodd"/>
                             </svg>
                            </div>
                            <img src="songs/${folder}/cover.jpg" alt="song image">
                            <h2>${response_json.title}</h2>
                            <p>${response_json.description}</p>
                        </div>`;
                    
                } catch (error) {
                    console.error(`Error loading JSON/Cover for ${folder}. The info.json is likely missing or malformed.`, error);
                }
            }
        }
    } catch (error) {
        console.error("MAJOR ERROR in displayAlbums: Network request failed.", error);
        cardContainer.innerHTML = "<p style='color: red; padding: 20px;'> Failed to load playlists. Server/Network connection error.</p>";
    }

    // Attach event listeners
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            let folderName = item.currentTarget.dataset.folder;
            let folderPath = `songs/${folderName}`;
            console.log(`Loading playlist: ${folderPath}`);
            songs = await getsongs(folderPath);

            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}



async function main() {

  await getsongs("songs/othersong");

  if (songs.length > 0) {
    playMusic(songs[0], true);
  }


  await displayAlbums();


  const playButton = document.querySelector("#play") || document.querySelector(".playbar .play"); 

  if (playButton) {
    playButton.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        playButton.src = "pause.svg";
      } else {
        currentSong.pause();
        playButton.src = "play.svg";
      }
    });
  }

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous button
  const previousButton = document.querySelector("#previous") || document.querySelector(".previous");
  if(previousButton) {
      previousButton.addEventListener("click", () => {
        currentSong.pause();
        let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentTrack);
        if (index - 1 >= 0) {
          playMusic(songs[index - 1]);
        }
      });
  }

  // Next button
  const nextButton = document.querySelector("#next") || document.querySelector(".next");
  if(nextButton) {
      nextButton.addEventListener("click", () => {
        currentSong.pause();
        let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentTrack);
        if (index + 1 < songs.length) {
          playMusic(songs[index + 1]);
        }
      });
  }

  // Volume control
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });
    
  // Mute toggle
  document.querySelector(".volume>img").addEventListener("click", e => {
      if (e.target.src.includes("volume.svg")) {
          e.target.src = e.target.src.replace("volume.svg", "mute.svg");
          currentSong.volume = 0;
          document.querySelector(".range input").value = 0;
      } else {
          e.target.src = e.target.src.replace("mute.svg", "volume.svg");
          currentSong.volume = .5;
          document.querySelector(".range input").value = 50;
      }
  })
}

main();
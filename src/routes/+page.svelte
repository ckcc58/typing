<script lang="ts">
    import { onMount } from "svelte";
    import { ChartGame} from "../lib/chart-game.ts"; //譜面を読み込ませ、色々するクラス
    import { addKeyHandler } from "../lib/hotkeys.ts";
    import { volume } from "../store.ts";


    let gameElement: HTMLDivElement;
    onMount(()=>{
        addKeyHandler();

        function adjustScale() {
            const scale = Math.min(Math.min(window.innerWidth / 800, window.innerHeight / 450), 1);
            gameElement.style.transform = `scale(${scale})`;
        }

        window.addEventListener("resize", adjustScale);
        adjustScale(); // 初期設定



        let tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        
        (window as any).onYouTubeIframeAPIReady = () => {
            document.addEventListener("keydown",function start(e: KeyboardEvent){
                if (e.key === "Enter") {
                    document.removeEventListener("keydown", start);
                    document.getElementById("start")?.remove();
                    fetch("/firefly.json")
                        .then(res => res.json())
                        .then(data => ChartGame.load(data));
                }
            })
        }
    })

</script>

<style>
    :global(body) {
        background-color: #383844;
    }

    #game {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        transform-origin: center top;
    }

    #control {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        align-items: center;
        width: 80vw;
        height: 30px;
        max-width: 800px;
    }

    #volume-controler {
        display: flex;
        grid-column: 4 / 5;
    }

    #volume {
        width: 30px;
        padding: 2px 4px;
        color: white;
        text-align: center;
        background-color: #333;
        border: 1px solid white;
        border-radius: 5px
    }

    #content {
        display: flex;
        width: 80vw;
        height: 45vw;
        max-width: 800px;
        max-height: 450px;
        overflow: hidden;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.3);
        border-radius: 5%;
    }

    #frame {
        width: 100%;
        height: 100%;
        position: relative;
        background-color: gray;
        border-radius: inherit;
    }

    #start {
        color: white;
        text-align: center;
        font-size: 30px;
        text-shadow: 0 0 10px white;
    }

    #lyrics {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: absolute;
        width: 100%;
        height: 50%;
        bottom: 0;
        padding-bottom: 10px;
        background-color: rgba(0, 0, 0, 0.75);
    }

    :global .lyric {
        display: flex;
        color: white;
        white-space: nowrap;
    }

    :global .phrase {
        display: flex;
        align-items: flex-end;
        margin-top: 5px;
        margin-left: 10px;
        height: 2em;
        border-bottom: 1px solid white;
        background-clip: content-box;
        box-sizing: border-box;
    }

    #text-input {
        width: 80vw;
        height: 40px;
        max-width: 800px;
        font-size: 1rem;
        color: white;
        background-color: #333;
        outline: none;
        border: none;
        border-top: 1px solid white;
        border-bottom: 1px solid white;
        box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.3);
        padding: 0 10px;
        box-sizing: border-box;
    }
</style>

<div id="game" bind:this={gameElement}>
    <div id="control">
        <div id="volume-controler">
            <input type="range" style="flex-grow: 1;" min="0" max="100" step="1" bind:value={$volume}/>
            <span id="volume">{$volume}</span>
        </div>
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="content">
        <div id="frame">
            <div id="player" style="width: inherit; height: inherit;"></div>
            <div id="lyrics">
                <div id="start">Enterキーで開始</div>
                <!-- <div class="lyric"></div> -->
            </div>
        </div>
    </div>
    <input id="text-input" type="text" placeholder="Type the lyrics here!"/>
    <div id="status">
        <div id="score" style="color: white;">score: 0</div>
    </div>
</div>
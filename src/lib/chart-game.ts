import { volume } from "../store.ts";
import { Tick } from "./tick.ts";

declare var YT: any;

type Chart = {
    title: string;
    ytId: string;
    lyric: {time: number; line: number; phrase: string}[];
}

class LyricStatus {
    maxActiveLrcsLength: number;
    activeLrcs: {line: number; phrase: string}[];
    phraseCount: number;
    latestLine: number;
    notes: number;

    constructor(maxActiveLrcsLength: number){
        this.maxActiveLrcsLength = maxActiveLrcsLength;
        this.activeLrcs = [];
        this.phraseCount = 0;
        this.latestLine = -1;
        this.notes = 0;
    }
}

export class ChartGame {
    static player: any;
    static LrcQueue: {line: number; phrase: string}[] = [];
    static lrcStatus = new LyricStatus(3);
    static chart: Chart;

    static maxScore: number = 100;
    static score: number = 0;

    static init(){
        document.title = "";
        this.score = 0;
    }

    static async load(chart: Chart){
        console.log(chart);

        this.player = new YT.Player("player", {
            videoId: chart.ytId,
            playerVars: {"autoplay": 1, "controls": 0},
            events: {
                "onReady": () => {
                    this.init();
                    volume.subscribe(volume => this.player.setVolume(volume));
                    this.chart = chart;
                    this.lrcStatus.notes = chart.lyric.reduce((acc, e) => acc + e.phrase.length, 0);
                    document.title = this.chart.title;
                    this.start();
                }
            }
        })
    }

    static start(){
        document.getElementById("text-input")?.focus();
        
        this.tick();

        document.getElementById("text-input")?.addEventListener("input", this.inputHandler as EventListener);
        document.getElementById("text-input")?.addEventListener("keydown", this.keydownHandler as EventListener);
    }

    static inputHandler = (e: InputEvent) => {
        let value = (e.target as HTMLInputElement).value;

        let matchIndex = this.lrcStatus.activeLrcs.findIndex(e => e.phrase === value);
        let startMatchIndex = this.lrcStatus.activeLrcs.findIndex(e => e.phrase.startsWith(value));

        if (matchIndex !== -1 && startMatchIndex >= matchIndex) {
            let match = this.lrcStatus.activeLrcs.splice(matchIndex, 1);

            this.score += (this.maxScore / this.lrcStatus.notes) * value.length;
            (document.getElementById("score") as HTMLDivElement).textContent = `score: ${this.score.toFixed(2)}`;

            (e.target as HTMLInputElement).blur();
            (e.target as HTMLInputElement).value = ""
            setTimeout(()=>{(e.target as HTMLInputElement).focus()});
        }
    }

    static keydownHandler = (e: KeyboardEvent) => {
        let nextTime = this.chart.lyric[this.lrcStatus.phraseCount]?.time;
        let currentTime = this.player.getCurrentTime();
        if (e.key === "Enter" && nextTime - currentTime >= 0.5) {
            this.player.seekTo(nextTime - 0.5, true);
        }
    }

    static tick(){
        let i = 0;
        let j = 0;
        Tick.on(() => {
            let audioTime = this.player.getCurrentTime();
            audioTime = audioTime;

            j = i;
            let nextTime = this.chart.lyric[j].time;
            while (audioTime >= nextTime) {
                let phrase = this.chart.lyric[j].phrase;
                let line = this.chart.lyric[j].line;
                this.LrcQueue.push({line: line, phrase: phrase});

                j = (j+1)|0;

                nextTime = this.chart.lyric[j]?.time;
            }

            if (this.LrcQueue.length) {
                i = i + this.LrcQueue.length;
                this.showLrc();
            }

            if (nextTime) {
                return true;
            }
        })
    }

    static showLrc(){
        for (let i = 0; i < this.LrcQueue.length; i++) {
            let line = this.LrcQueue[i].line;
            let phrase = this.LrcQueue[i].phrase;

            this.lrcStatus.activeLrcs.push({line: line, phrase: phrase});
            this.lrcStatus.phraseCount++;

            if (this.lrcStatus.latestLine < line) {
                this.lrcStatus.latestLine = line;
                document.getElementById("lyrics")?.insertAdjacentHTML("beforeend","<div class='lyric'></div>");
            }

            [...document.getElementsByClassName("lyric")].at(line - this.lrcStatus.latestLine - 1)?.insertAdjacentHTML("beforeend","<div class='phrase'>" + phrase + "</div>");

            if (document.getElementsByClassName("lyric").length > this.lrcStatus.maxActiveLrcsLength) {
                document.getElementsByClassName("lyric")[0].remove();
            }
        }

        this.LrcQueue = [];
    }
}
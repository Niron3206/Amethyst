import { useLocalStorage } from "@vueuse/core";
import { computed, reactive } from "vue";
import { AmethystNotification } from "./notification";

export default class AppState {
	public state = reactive({
		notifications: [] as AmethystNotification[],
		allowedExtensions: [] as string[],
		cpuUsage: 0,
		version: "",
		isMinimized: false,
		isMaximized: false,
		processQueue: new Set(),
		coverProcessQueue: 0,
		bpmProcessQueue: 0,
		coverCache: useLocalStorage<Record<string, string>>("cover-cache", {}),
		bpmCache: useLocalStorage<Record<string, number>>("bpm-cache", {}),
		waveformCache: useLocalStorage<Record<string, ImageBitmap>>("waveform-cache", {}),
		defaultCover: "",
		theme: "amethyst-dark",
		lobbyId: undefined as string | undefined,
	});

	public settingsObject = {
		useLogarithmicSpectrum: true,
		showMiniCovers: true,
		showCoverArt: true,
		spectrumVerticalZoom: 1.5,
		colorInterfaceFromCoverart: false,
		spectrumFftSize: 8192,
		vectorscopeLineThickness: 1,
		diagonalVectorscope: true,
		spectrumSmoothing: 0.5,
		showSpectrum: true,
		showVectorscope: true,
		showDbMeter: true,
		showNotifications: true,
		smoothScrollSpeed: 0.075,
		playOnStartup: false,
		discordRichPresence: true,
	};

	public settings = useLocalStorage("settings", this.settingsObject, { writeDefaults: true }).value;

	public coverArtCacheSize = computed(() => JSON.stringify(this.state.coverCache).length);
	public bpmCacheSize = computed(() => JSON.stringify(this.state.bpmCache).length);
	public waveformCacheSize = computed(() => JSON.stringify(this.state.waveformCache).length);
	public isDev = computed(() => this.state.version.includes("DEV"));

	public applyCurrentTheme = () => {
		const dom = document.querySelector("html");
		dom!.className = `theme-${this.state.theme}`;
	};

	constructor() {
		this.applyCurrentTheme();
		Object.keys(this.settingsObject).forEach((key) => {
			// @ts-ignore
			if (this.settings[key] === undefined || this.settings[key] === null)
				// @ts-ignore
				this.settings[key] = this.settingsObject[key];
		});

	}
}

// recursively goes through every file in the folder and flattens it
export function bytesToHuman(bytes: number): string {
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	if (bytes === 0)
		return "0 B";
	const i = ~~(Math.log(bytes) / Math.log(1024));
	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

<script setup lang="ts">
import { useShortcuts, useState } from "@/amethyst";
import { Track } from "@/logic/track";
import BaseChip from "@/components/BaseChip.vue";
import { PlayIcon, ExternalLinkIcon, LoadingIcon, BinocularsIcon, ErrorIcon } from "@/icons/material";
import Cover from "@/components/CoverArt.vue";
import { player } from "@/logic/player";
import { useContextMenu } from "@/components/ContextMenu";
import { RemoveIcon, ResetIcon } from "@/icons/material";
import { useInspector } from "./Inspector";

defineProps<{tracks: Track[]}>();
const state = useState();
const isHoldingControl = useShortcuts().isControlPressed;
const invoke = window.electron.ipcRenderer.invoke;

// Context Menu options for this component 
const handleContextMenu = ({x, y}: MouseEvent, track: Track) => {
  useContextMenu().open({x, y}, [
    { title: "Play", icon: PlayIcon, action: () => player.play(track) },
    { title: "Inspect", icon: BinocularsIcon, action: () => useInspector().inspectAndShow(track) },
    { title: "Open in Explorer...", icon: ExternalLinkIcon, action: () => invoke("show-item", [track.path]) },
    { title: "Reload metadata", icon: ResetIcon, action: () => track.fetchAsyncData(true) },
    { title: "Remove from queue", icon: RemoveIcon, red: true, action: () => player.queue.remove(track) },
  ]);
};

</script>

<template>
  <div class="text-12px min-h-0 h-full flex flex-col text-left relative select-none">
    <header class="flex text-primary-900 font-bold mb-2 mr-1">
      <div class="w-4" />
      <div class="min-w-1/4">
        Filename
      </div>
      <div class="th">
        Artist
      </div>
      <div class="th">
        Title
      </div>
      <div class="th">
        Album
      </div>
      <div class="th max-w-16">
        Container
      </div>
      <div class="th max-w-24">
        Size <strong>{{ player.queue.getTotalSizeFormatted() }}</strong>
      </div>
      <div class="th max-w-32">
        Duration <strong>{{ player.queue.getTotalDurationFormatted() }}</strong>
      </div>
    </header>
    <RecycleScroller
      class="h-full"
      :items="tracks"
      :item-size="16"
      key-field="path"
      :buffer="32"
    >
      <template
        #default="{ item }"
      >
        <div
          :class="[
            isHoldingControl && 'control cursor-external-pointer', 
            item.hasErrored && 'opacity-50 not-allowed',
            player.getCurrentTrack()?.path == item.path && 'active'
          ]"
          class="row"
          @contextmenu="handleContextMenu($event, item)"
          @keypress.prevent
          @click="isHoldingControl ? invoke('show-item', [item.path]) : player.play(item)"
        >
          <div
            class="td max-w-4"
          >
            <loading-icon
              v-if="item.isLoading"
              class="h-3 animate-spin w-3 min-h-3 min-w-3"
            />
            <error-icon
              v-else-if="item.hasErrored"
              class="h-3 w-3 min-h-3 min-w-3"
            />
    
            <cover
              v-else
              class="w-3 h-3"
              :url="(item.isLoaded ? item.getCover() : state.state.defaultCover) as string"
            />
          </div>
          <div class="td min-w-1/4">
            {{ player.getCurrentTrack()?.path == item.path ? "⏵ " : "" }}{{ item.getFilename() }}
          </div>
          <div class="td">
            <span v-if="item.getArtistsFormatted()">
              {{ item.getArtistsFormatted() }}
            </span>
            <span
              v-else
              class="text-primary-900 text-opacity-50"
            >
              n/a
            </span>
          </div>

          <div class="td">
            <span v-if="item.getTitle()">
              {{ item.getTitle() }}
            </span>
            <span
              v-else
              class="text-primary-900 text-opacity-50"
            >
              n/a
            </span>
          </div>

          <div class="td">
            <span v-if="item.getAlbumFormatted()">
              {{ item.getAlbumFormatted() }}
            </span>
            <span
              v-else
              class="text-primary-900 text-opacity-50"
            >
              n/a
            </span>
          </div>
          <div class="td max-w-16">
            <BaseChip
              v-if="item.getMetadata()?.format.container"
              class="text-8px"
            >
              {{ item.getMetadata()?.format.container }}
            </BaseChip>
          </div>
          <div class="td max-w-24">
            {{ item.getFilesizeFormatted() }}
          </div>
          <div class="td max-w-32">
            {{ item.getDurationFormatted(true) }}
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style lang="postcss">

.th,
.td {
  @apply flex-1 overflow-hidden;

  & strong {
    @apply text-primary-900 text-9px text-opacity-50;
  }
}

.td {
  @apply overflow-hidden overflow-ellipsis;
}

.row {
  @apply text-primary-900 h-4 w-full flex;

  &:hover {
    @apply text-white;
  }

  &.control:hover {
    @apply underline;
  } 

  &.active:not(:hover) {
    @apply text-primary-800;
  }
}

.vue-recycle-scroller__slot {
  @apply flex;
}

.vue-recycle-scroller__slot,
.vue-recycle-scroller__item-view {
  @apply  text-left;
}

.vue-recycle-scroller__slot .th:first-child,
.vue-recycle-scroller__item-view .td:first-child {
  @apply w-4 max-w-4;
}

</style>
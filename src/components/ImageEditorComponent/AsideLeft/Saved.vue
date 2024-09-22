<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
    showCloseButton: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['close']);
const isClosing = ref(false);

function clicked() {
    isClosing.value = true;
    setTimeout(() => {
        emit('close');
    }, 300);
}
</script>

<template>
    <div class="relative flex">
        <div :class="[
            'transition-all duration-300 ease-in-out',
            'mx-auto',
            isClosing ? 'w-0' : 'w-[20vw]',
            props.showCloseButton ?
                'bg-Secondary h-screen' :
                'bg-Background my-4 rounded-xl shadow-[0_-1px_40px_-15px] shadow-slate-800/50 h-[95vh]'
        ]">
            <div class="whitespace-nowrap overflow-hidden">
                <label for="name">Saved</label>
            </div>
        </div>
        <div v-if="props.showCloseButton" :class="[
            'absolute top-4 transition-all duration-300 ease-in-out',
            isClosing ? 'right-[calc(100%-3vw)]' : 'right-0'
        ]">
            <button class="cursor-pointer p-1 bg-Background rounded-l-xl hover:bg-Main" @click="clicked">
                <svg class="icon-svg" width="2vw" height="4vh" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 8L10 12L14 16" stroke="#200E32" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.icon-svg {
    transition: stroke 0.3s ease;
}

button:hover .icon-svg path {
    stroke: #f25042;
}
</style>
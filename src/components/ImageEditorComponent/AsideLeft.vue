<script setup>
import { ref, inject } from 'vue';

import addon1 from '../../assets/Images/sticker/add1.png';
import addon2 from '../../assets/Images/sticker/add2.png';
import addon3 from '../../assets/Images/sticker/add3.png';
import addon4 from '../../assets/Images/sticker/add4.png';
import addon5 from '../../assets/Images/sticker/add5.png';
import addon6 from '../../assets/Images/sticker/add6.png';

let images = ref([
    { src: addon1, alt: 'add on 1' },
    { src: addon2, alt: 'add on 2' },
    { src: addon3, alt: 'add on 3' },
    { src: addon4, alt: 'add on 4' },
    { src: addon5, alt: 'add on 5' },
    { src: addon6, alt: 'add on 6' },
]);

const handleStickerSelected = inject('handleStickerSelected');

const onStickerClick = (stickerSrc) => {
    handleStickerSelected(stickerSrc);
};
</script>

<template>
    <div class="bg-Surface left-0 h-screen w-[22vw] py-5">
        <div class="max-h-[95vh] w-[22vw] overflow-y-auto grid grid-cols-2 gap-2 items-center justify-center p-5">
            <div v-for="(img, index) in images" :key="index" class="object-fill flex justify-center items-center">
                <img class="max-w-[8vw] cursor-pointer hover:opacity-60 transition-opacity duration-200" :src="img.src"
                    :alt="img.alt" @click="onStickerClick(img.src)" />
            </div>
        </div>
    </div>
</template>
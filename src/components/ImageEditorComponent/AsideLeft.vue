<script setup>
import { ref } from "vue"

import addon1 from "../../assets/Images/sticker/add3.jpg"
import addon2 from "../../assets/Images/sticker/add2.jpg"
import addon3 from "../../assets/Images/sticker/add1.jpg"
import addon4 from "../../assets/Images/sticker/add4.jpg"
import addon5 from "../../assets/Images/sticker/add5.jpg"
import addon6 from "../../assets/Images/sticker/add6.jpg"
import addon7 from "../../assets/Images/sticker/add7.jpg"
import addon8 from "../../assets/Images/sticker/add8.jpg"
import addon9 from "../../assets/Images/sticker/add9.jpg"
import addon10 from "../../assets/Images/sticker/add10.jpg"
import addon11 from "../../assets/Images/sticker/add11.jpg"
import addon12 from "../../assets/Images/sticker/add12.jpg"
import addon13 from "../../assets/Images/sticker/add13.jpg"
import addon14 from "../../assets/Images/sticker/add14.jpg"
import addon15 from "../../assets/Images/sticker/add15.jpg"
import addon16 from "../../assets/Images/sticker/add16.jpg"
import addon17 from "../../assets/Images/sticker/add17.jpg"
import addon18 from "../../assets/Images/sticker/add18.jpg"
import addon19 from "../../assets/Images/sticker/add19.jpg"
import addon20 from "../../assets/Images/sticker/add20.jpg"

let images = ref([
    { src: addon1, alt: 'add on 1' },
    { src: addon2, alt: 'add on 2' },
    { src: addon3, alt: 'add on 3' },
    { src: addon4, alt: 'add on 4' },
    { src: addon5, alt: 'add on 5' },
    { src: addon6, alt: 'add on 6' },
    { src: addon7, alt: 'add on 7' },
    { src: addon8, alt: 'add on 8' },
    { src: addon9, alt: 'add on 9' },
    { src: addon10, alt: 'add on 10' },
    { src: addon11, alt: 'add on 11' },
    { src: addon12, alt: 'add on 12' },
    { src: addon13, alt: 'add on 13' },
    { src: addon14, alt: 'add on 14' },
    { src: addon15, alt: 'add on 15' },
    { src: addon16, alt: 'add on 16' },
    { src: addon17, alt: 'add on 17' },
    { src: addon18, alt: 'add on 18' },
    { src: addon19, alt: 'add on 19' },
    { src: addon20, alt: 'add on 20' },
])
</script>

<template>
    <div class="bg-Surface left-0 h-screen w-[22vw] py-5">
        <div class="max-h-[95vh] w-[22vw] overflow-y-auto grid grid-cols-2 gap-2 items-center justify-center p-5">
            <div v-for="(img, index) in images" :key="index" class="object-fill flex justify-center items-center">
                <img class="max-w-[8vw]" :src="img.src" :alt="img.alt" />
            </div>
        </div>
    </div>
</template>

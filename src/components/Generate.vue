<script setup>
import { ref } from 'vue'
import OpenAI from 'openai'
import LoadingGIF from '../assets/Images/Loading.gif'

const openai = new OpenAI({
    organization: 'org-XXygSipTZ0fjqKM619BA11Cp',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
})

let response = ref(null)
let prompt = ref('')
let image_url = ref('')
let isLoading = ref(false)

const getCompletions = async () => {
    if (isLoading.value) return

    try {
        isLoading.value = true
        response.value = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt.value,
            n: 1,
            size: "1024x1024",
        })
        image_url.value = response.value.data[0].url
        console.log(image_url.value)
    } catch (error) {
        console.error('Error generating image:', error)
    } finally {
        isLoading.value = false
    }
}

</script>

<template>
    <main class="px-20 py-10">
        <p class="text-xl font-bold">Prompt</p>
        <textarea v-model="prompt" class="border-2 border-black px-5 py-2 w-[600px] h-[200px]" maxlength="1000"
            placeholder="Enter your prompt (max 1000 words)"></textarea>
        <button @click="getCompletions" :disabled="isLoading"
            class="border-2 border-black px-5 py-2 bg-black text-white font-bold" type="button">
            {{ isLoading ? 'Loading...' : 'Generate' }}
        </button>
        <p>Image-url: {{ image_url }}</p>
        <div v-if="isLoading" class="flex items-center justify-center mt-5">
            <img :src="LoadingGIF" alt="Loading..." />
        </div>
        <img v-else-if="image_url" class="w-[1024px] h-[1024px] border border-black mt-5" :src="image_url"
            alt="Generated Image">
    </main>
</template>
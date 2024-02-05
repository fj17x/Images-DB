<script>
  import { userDetails } from "../stores/userDetails.js"
  import { onMount } from "svelte"
  import "@fortawesome/fontawesome-free/css/all.min.css"

  const checkSignedIn = async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })
    if (!response.ok) {
      {
        userDetails.set({})
        return
      }
    }
    const reply = await response.json()
    userDetails.set(reply.data)
  }

  onMount(async () => {
    await checkSignedIn()
  })
</script>

<slot />

<style>
  :root {
    font:
      1.2em "Fira Sans",
      sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
  }
</style>

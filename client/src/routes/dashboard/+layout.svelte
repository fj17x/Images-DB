<script>
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"

  const checkSignedIn = async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })
    if (!response.ok) {
      goto("/")
    }
  }

  onMount(async () => {
    await checkSignedIn()
  })
</script>

<slot />

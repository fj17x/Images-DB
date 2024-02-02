<script>
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"

  const checkSignedIn = async () => {
    const response = await fetch(`http://localhost:4000/images`, {
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

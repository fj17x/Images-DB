<script>
  import { onMount } from "svelte"
  import Dashboard from "$lib/components/Dashboard.svelte"
  import ImageCard from "$lib/components/ImageCard.svelte"

  let userName = "Unknown User"
  let currentOffset = 0
  let images = []

  const fetchNextImages = async () => {
    const response = await fetch(`http://localhost:4000/images?offset=${currentOffset}&limit=9&sortBy=id&sortOrder=asc`, {
      method: "GET",
      credentials: "include",
    })

    const imagesReply = await response.json()
    images = [...images, ...imagesReply.data]
  }

  onMount(async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      userName = reply.data.userName
      userName = userName[0].toUpperCase() + userName.slice(1)
    } else {
      alert("Please sign in!")
      window.location.href = "/signin"
    }

    fetchNextImages()
  })
</script>

<div class="container">
  <Dashboard />
  <div class="content">
    <h2>Your images:</h2>

    <div class="main-card">
      {#if images.length > 0}
        {#each images as { id, url, title }}
          <ImageCard {id} {url} {title} />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css?family=Poppins:400,700,900");

  .container {
    display: flex;
  }

  .content {
    margin-left: 14vw;
    flex: 1;
    padding: 0px 2rem;
  }

  .main-card {
    background-color: #1ca496;
    font-family: "Poppins", sans-serif;
    font-weight: 300;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    place-items: center;
  }
</style>

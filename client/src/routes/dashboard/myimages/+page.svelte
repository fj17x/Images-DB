<script>
  import { onMount } from "svelte"
  import Dashboard from "$lib/components/Dashboard.svelte"
  import ImageCard from "$lib/components/ImageCard.svelte"

  let currentOffset = 0
  let images = []

  const fetchNextImages = async () => {
    const response = await fetch(
      `http://localhost:4000/images?offset=${currentOffset}&limit=9&sortBy=id&sortOrder=asc&showDeleted=true&showFlagged=true`,
      {
        method: "GET",
        credentials: "include",
      }
    )

    const imagesReply = await response.json()
    images = [...images, ...imagesReply.data]
    currentOffset += 9
  }

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
      fetchNextImages()
    }
  }

  onMount(async () => {
    fetchNextImages()
  })
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container">
  <Dashboard />
  <div class="content">
    {#await fetchNextImages()}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:then}
      {#if images.length > 0}
        <h2>Your images:</h2>
        <div class="main-card" on:scroll={handleScroll}>
          {#each images as { id, url, title, destroyTime }}
            <ImageCard {id} {url} {title} {destroyTime} />
          {/each}
        </div>
      {:else}
        <div class="no-images-message">
          <p>
            You haven't uploaded any images yet. Start by uploading your favorite images by <a href="/dashboard/upload"
              >clicking here!</a
            >
          </p>
        </div>
      {/if}
    {/await}
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css?family=Poppins:400,700,900");

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }
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
    align-items: start;
  }

  .no-images-message {
    text-align: center;
    padding: 2rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
    margin: 2rem;
    max-width: 400px;
  }

  .no-images-message p {
    margin-bottom: 1rem;
  }

  .no-images-message a {
    text-decoration: none;
    color: #1ca496;
    font-weight: bold;
  }
</style>

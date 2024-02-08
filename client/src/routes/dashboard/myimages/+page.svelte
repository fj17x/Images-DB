<script>
  import Sidebar from "$lib/components/Sidebar.svelte"
  import ImageCard from "$lib/components/ImageCard.svelte"

  let currentOffset = 0
  let images = []

  const fetchNextImages = async () => {
    const response = await fetch(
      `http://localhost:4000/images?offset=${currentOffset}&sortBy=id&sortOrder=asc&showDeleted=true&showFlagged=true`,
      {
        method: "GET",
        credentials: "include",
      }
    )

    const imagesReply = await response.json()

    if (!imagesReply.data || imagesReply.data.length === 0) {
      return
    }

    const uniqueImages = imagesReply.data.filter((newImage) => {
      return !images.some((existingImage) => existingImage.id === newImage.id)
    })
    images = [...images, ...uniqueImages]
    currentOffset += 9
  }

  const handleScroll = async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 70) {
      await fetchNextImages()
    }
  }
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container-fluid p-0 m-0">
  <Sidebar />
  <div class="content pt-4 {images.length < 1 ? 'none-found' : ''}">
    {#await fetchNextImages()}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:then}
      {#if images.length > 0}
        <h2 class="pb-4">Your images:</h2>
        <div class="main-card">
          {#each images as { id, url, title, destroyTime, isFlagged }}
            <ImageCard {id} {url} {title} {destroyTime} {isFlagged} />
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

  .none-found {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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

  .content {
    margin-left: 14vw;
    flex: 1;
    padding: 0px 2rem;
  }

  .main-card {
    background-color: #ffffff;
    font-family: "Poppins", sans-serif;
    font-weight: 300;
    border-radius: 0.8rem;
    box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.1);
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

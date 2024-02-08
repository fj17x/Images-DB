<script>
  import { onMount } from "svelte"
  export let url, title, id, destroyTime, isFlagged
  export let isSingleImage = false
  let isLoading = true

  function handleImageLoad() {
    isLoading = false
  }

  onMount(() => {
    const image = new Image()
    image.src = url
    image.onload = handleImageLoad
  })
</script>

<div class="card border-0">
  <a href="/dashboard/myimages/{id}" class="anchor">
    {#if isLoading}
      <div class="loading-spinner d-flex justify-content-center align-items-center text-dark">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:else}
      <img src={url} alt={title} on:load={handleImageLoad} class="image {isSingleImage ? 'single' : ''}" />
      <p
        class="card-title {destroyTime ? 'destroyed' : isFlagged ? 'flagged' : 'normal'} {isSingleImage
          ? 'singleText'
          : 'multipleText'}"
      >
        {title}
      </p>
    {/if}
  </a>
</div>

<style>
  .loading-spinner {
    height: 200px;
  }

  .singleText {
    font-size: 1.3rem;
  }

  .multipleText {
    margin-top: 1rem;
  }

  .destroyed {
    color: red;
  }

  .flagged {
    color: orange;
  }

  .normal {
    color: black;
  }

  .image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  .single {
    max-width: 800px;
    height: 400px;
    object-fit: contain;
  }

  .anchor {
    text-decoration: none;
  }
</style>

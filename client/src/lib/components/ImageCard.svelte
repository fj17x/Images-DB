<script>
  import { onMount } from "svelte"
  export let url, title, id, destroyTime
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

<div class="card">
  <a href="/dashboard/myimages/{id}" class="anchor">
    {#if isLoading}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:else}
      <img src={url} alt={title} on:load={handleImageLoad} />
      <p class="title {destroyTime ? 'destroyed' : 'normal'}">{title}</p>
    {/if}
  </a>
</div>

<style>
  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
  }
  .card {
    border-radius: 8px;
    overflow: hidden;
    width: 300px;
  }
  .destroyed {
    color: red;
  }

  .normal {
    color: black;
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  .title {
    margin-top: 0.4rem;
  }

  .anchor {
    text-decoration: none;
    color: #fff;
  }
</style>

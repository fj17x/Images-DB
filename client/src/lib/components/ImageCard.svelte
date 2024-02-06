<script>
  import { onMount } from "svelte"
<<<<<<< HEAD
  export let url, title, id, destroyTime, isFlagged
=======
  export let url, title, id, destroyTime
>>>>>>> fcf123b3ae2a4648a94b5928dc53cff344d5724c
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

<div class="card">
  <a href="/dashboard/myimages/{id}" class="anchor">
    {#if isLoading}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:else}
      <img src={url} alt={title} on:load={handleImageLoad} class={isSingleImage ? "single" : "multiple"} />
      <p
        class="title {destroyTime ? 'destroyed' : isFlagged ? 'flagged' : 'normal'} {isSingleImage
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
  }

  .multiple {
    width: 300px;
  }
  .single {
    max-width: 800px;
    height: 400px;
    object-fit: contain;
  }

  .singleText {
    font-size: 1.5rem;
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

<script>
  import ImageCard from "./ImageCard.svelte"
  export let showModal
  export let images
  let dialog

  $: if (dialog && showModal) dialog.showModal()
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => dialog.close()}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    {#if images.length > 1}
      <div class="row">
        {#each images as { id, url, title, destroyTime, isFlagged }}
          <div class="col-md-6 mb-3">
            <ImageCard {url} {title} {id} {destroyTime} {isFlagged} />
          </div>
        {/each}
      </div>
    {:else if images.length == 1}
      <div class="single">
        <ImageCard url={images[0].url} title={images[0].title} id={images[0].id} isSingleImage={true} />
      </div>
    {/if}
    <button class="close-button" on:click={() => dialog.close()}>Close</button>
  </div>
</dialog>

<style>
  .single {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  dialog {
    width: 90%;
    max-width: 800px;
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }

  dialog > div {
    padding: 1em;
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  button {
    display: block;
  }

  .close-button {
    display: block;
    margin: auto;
    padding: 0.5em 1em;
    margin-top: 1em;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 0.2em;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
  }

  .close-button:hover {
    background-color: #0056b3;
  }
</style>

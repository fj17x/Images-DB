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
    <div class="image-grid">
      {#each images as { id, url, title }}
        <ImageCard {url} {title} {id} />
      {/each}
    </div>
    <button class="close-button" autofocus on:click={() => dialog.close()}>Close</button>
  </div>
</dialog>

<style>
  dialog {
    width: 90%; /* Adjust as needed */
    max-width: 800px; /* Set a maximum width */
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(150px, 1fr)); /* Adjust column width as needed */
    gap: 1em;
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
    background-color: #007bff; /* Adjust as needed */
    color: #fff; /* Adjust as needed */
    border: none;
    border-radius: 0.2em;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
  }

  .close-button:hover {
    background-color: #0056b3; /* Adjust as needed */
  }
</style>

<script>
  export let showModal
  export let onChoiceConfirm
  export let header
  export let text

  let dialog

  $: if (dialog && showModal) dialog.showModal()
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <h2>{header}</h2>
    <hr />
    <p>{text}</p>
    <button class="close-button red" on:click={() => onChoiceConfirm(true)}>Yes</button>
    <button class="close-button green" on:click={() => onChoiceConfirm(false)}>No</button>
  </div>
</dialog>

<style>
  dialog {
    max-width: 32em;
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

  .close-button {
    display: block;
    margin: auto;
    padding: 0.5em 1em;
    margin-top: 1em;
    color: #fff;
    border: none;
    border-radius: 0.2em;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
  }

  .green {
    background-color: rgb(62, 175, 58);
  }
  .red {
    background-color: rgb(165, 26, 26);
  }

  .green:hover {
    background-color: green;
    transform: scale(1.05);
  }

  .red:hover {
    background-color: red;
    transform: scale(1.05);
  }
</style>

<script>
  import AlertModal from "$lib/components/AlertModal.svelte"

  export let showModal
  export let onEditConfirm
  export let oldUserName

  let dialog

  let userName = oldUserName
  let password

  let showAlertModal = false
  let alertModalOptions = {}

  $: if (dialog && showModal) dialog.showModal()
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <h2>Edit your details</h2>
    <hr />
    <div class="card-form">
      <span>
        <span class="check">
          <label for="title">Change username:</label>
        </span>
        <br />

        <input type="text" class="full" name="userName" bind:value={userName} />
      </span>
      <br /><br />
      <span>
        <span class="check">
          <label for="title">Change password:</label>
        </span>
        <br />
        <input
          type="password"
          class="full"
          name="password"
          placeholder="Leave empty for current password."
          bind:value={password}
        />
      </span>

      <br />
      <button class="close-button red" type="button" on:click={onEditConfirm(false)}>Cancel</button>
      <button class="close-button green" type="button" on:click={onEditConfirm(true, { userName, password })}>Confirm</button>
    </div>
  </div>
</dialog>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .check {
    display: flex;
  }

  label {
    font-weight: bold;
    display: flex;
    align-items: center;
  }

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

  label {
    font-weight: bold;
  }

  .full {
    width: 90%;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button.close-button {
    display: inline-block;
    padding: 0.5em 1em;
    margin-top: 1em;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
  }

  button.green {
    background-color: rgb(62, 175, 58);
  }

  button.red {
    background-color: rgb(165, 26, 26);
  }

  button:hover {
    transform: scale(1.05);
  }

  button.green:hover {
    background-color: green;
  }

  button.red:hover {
    background-color: red;
  }
</style>

<script>
  import AlertModal from "$lib/components/AlertModal.svelte"

  export let showModal
  export let onEditConfirm
  export let oldUser
  export let isfullEdit = false

  let dialog

  let updatedDetails = {}

  updatedDetails.userName = oldUser.userName
  updatedDetails.id = oldUser.id
  updatedDetails.isAdmin = oldUser.isAdmin

  let showAlertModal = false
  let alertModalOptions = {}

  $: if (dialog && showModal) dialog.showModal()
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->

<dialog bind:this={dialog} on:close={() => (showModal = false)} class="border-0 p-1 rounded">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation class="p-3">
    <h2>{isfullEdit ? "Edit details" : "Edit your details"}</h2>
    <hr />
    <div class="card-form d-flex justify-content-center flex-column">
      {#if isfullEdit}
        <div class="mb-2">
          <div class="d-flex justify-content-center">
            <label for="title" class="fw-bold">Change id:</label>
          </div>
          <input type="number" class="full" name="id" bind:value={updatedDetails.id} />
        </div>{/if}
      <div class="mb-2">
        <div class="d-flex justify-content-center">
          <label for="title" class="fw-bold">Change username:</label>
        </div>

        <input type="text" class="full" name="userName" bind:value={updatedDetails.userName} />
      </div>
      <div class="mb-2">
        <div class="d-flex justify-content-center">
          <label for="title" class="fw-bold">Change password:</label>
        </div>
        <input
          type="password"
          class="full"
          name="password"
          placeholder="Leave empty for current password."
          bind:value={updatedDetails.password}
        />
      </div>

      {#if isfullEdit}
        <div class="mb-2">
          <div class="d-flex justify-content-center">
            <label for="title" class="fw-bold">Is Admin?</label>
          </div>
          <div class="d-flex justify-content-around">
            <div>
              <input type="radio" id="isAdminTrue" name="isAdmin" value="true" bind:group={updatedDetails.isAdmin} />
              <label for="isAdminTrue">Yes</label>
            </div>
            <div>
              <input type="radio" id="isAdminFalse" name="isAdmin" value="false" bind:group={updatedDetails.isAdmin} />
              <label for="isAdminFalse">No</label>
            </div>
          </div>
        </div>
      {/if}
      <div class="d-flex justify-content-around">
        <button class="btn close-button text-white red mt-2" type="button" on:click={onEditConfirm(false)}>Cancel</button>
        <button class="btn close-button text-white green mt-2" type="button" on:click={onEditConfirm(true, updatedDetails)}
          >Confirm</button
        >
      </div>
    </div>
  </div>
</dialog>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
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

  .full {
    width: 100%;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .close-button {
    transition: background-color 0.3s ease;
  }

  .green {
    background-color: rgb(62, 175, 58);
  }

  .red {
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

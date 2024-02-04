<script>
  export let showModal
  export let onEditConfirm
  export let oldTitle, oldDescription, oldTags, oldUrl
  import AlertModal from "$lib/components/AlertModal.svelte"

  let dialog

  let title = oldTitle
  let description = oldDescription
  let tags = oldTags
  let url = oldUrl

  let showAlertModal = false
  let alertModalOptions = {}

  let toAddTag

  $: if (dialog && showModal) dialog.showModal()

  const addTag = () => {
    const tagValue = toAddTag.trim()

    if (tagValue) {
      if (!tags.includes(tagValue)) {
        tags = [...tags, tagValue]
        toAddTag = ""
      } else {
        alertModalOptions.header = "Could not add tag"
        alertModalOptions.message = "Tag already exists!"
        alertModalOptions.type = "failure"
        showAlertModal = true
      }
    } else {
      alertModalOptions.header = "Could not add tag"
      alertModalOptions.message = "Please enter a tag!"
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const removeTag = (toRemoveTag) => {
    tags = tags.filter((tag) => tag !== toRemoveTag)
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <h2>Edit Image</h2>
    <hr />
    <div class="card-form">
      <span>
        <label for="title">Change title:</label>
        <br />
        <input type="text" class="full" name="title" bind:value={title} /></span
      ><br /><br />
      <span>
        <span>
          <label for="title">Change description:</label>
          <br />
          <textarea type="text" class="full" rows="4" name="description" bind:value={description} /></span
        > <br />

        <span>
          <label for="title">Change URL:</label>
          <br />
          <input type="text" class="full" name="url" bind:value={url} /></span
        >
        <span
          ><br /><br />
          <label for="title">Modify tags:</label>
          <br />
          <span>
            <input type="text" name="tag" id="tag" bind:value={toAddTag} />
            <button type="button" class="tag-button" on:click={addTag}>Add</button>
          </span>
          <br />
          {#each tags as tag}
            <span class="tag-container">
              <button type="button" class="tag-toggle" on:click={() => removeTag(tag)}>
                {tag}
                <span class="remove-tag">
                  <i class="fa fa-times"></i>
                </span>
              </button>
            </span>
          {/each}
        </span> <br />
        <button class="close-button red" type="button" on:click={onEditConfirm(false)}>Cancel</button>
        <button class="close-button green" type="button" on:click={onEditConfirm(true, { title, description, tags, url })}>
          Confirm
        </button>
      </span>
    </div>
  </div>
</dialog>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .tag-toggle {
    background-color: rgb(207, 59, 59);
    border-radius: 10px;
    color: white;
    font-size: 0.7rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

  textarea {
    padding: 0.5rem;
    max-width: 20rem;
    min-width: 250px;
    max-height: 10rem;
    min-height: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
    width: 10rem;
  }

  .tag-button {
    font-size: 0.85rem;
    border-radius: 0.3rem;
    color: #fff;
    cursor: pointer;
    border: none;
    background-color: #172740;
    padding: 0.1rem 1rem;
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

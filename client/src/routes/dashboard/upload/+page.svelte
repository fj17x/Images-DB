<script>
  import Sidebar from "$lib/components/Sidebar.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { onMount } from "svelte"

  let tags = []

  let showAlertModal = false
  let alertModalOptions = {}

  let title
  let description
  let uploadedFile
  let url = "https://"

  let toAddTag

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

  const handleUpload = async () => {
    if (uploadedFile === undefined && url === undefined) {
      alertModalOptions.header = "Could not upload"
      alertModalOptions.message = "Please upload the image or enter URL."
      alertModalOptions.type = "other"
      showAlertModal = true
      return
    }

    const data = { title, description, tags, url }
    const response = await fetch(`http://localhost:4000/images`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    const reply = await response.json()
    tags = []
    if (response.ok) {
      alertModalOptions.header = "Uploaded successfully"
      alertModalOptions.message = reply.message
      alertModalOptions.type = "success"
      showAlertModal = true
    } else {
      alertModalOptions.header = "Could not upload"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  onMount(async () => {})
</script>

<div class="container-fluid p-0 m-0">
  <Sidebar />
  <div class="content pt-4">
    <h3 class="pb-3">Upload an Image:</h3>

    <div class="main-card px-4 py-3">
      <form
        class="text-white d-flex flex-column justify-content-center align-items-between pb-3"
        on:submit|preventDefault={handleUpload}
      >
        <span>
          <label for="title">Title*:</label>
          <!-- svelte-ignore a11y-autofocus -->
          <input
            autofocus
            type="text"
            name="title"
            class="normal-input form-control mb-3 p-2"
            bind:value={title}
            required
          /></span
        >
        <span>
          <label for="title">Description:</label>
          <textarea class="normal-input form-control mb-3 p-2" bind:value={description} name="description" /></span
        >
        <div>
          <div>
            <label for="title">Tags:</label>
          </div>
          <input type="text" name="tag" class="normal-input mb-1 p-2" bind:value={toAddTag} id="tag" />
          <button class="btn tag-button text-white p-2" type="button" on:click={addTag}>Add tag</button>
          <br />
          <div class="tag-list-container">
            <div class="tag-list">
              {#each tags as tag}
                <button type="button" class="tag-toggle mt-2" on:click={() => removeTag(tag)}>
                  {tag}
                  <span class="remove-tag">&times;</span>
                </button>
                <span>&nbsp</span>
              {/each}
            </div>
          </div>
          <div class="upload-options d-flex justify-content-around align-items-center my-3">
            <div class="file-div">
              <!-- <label for="file">Upload File:</label> -->
              <input class="form-control-file" type="file" name="file" bind:value={uploadedFile} />
            </div>
            <div class="or-separator">OR</div>
            <div class="url-div">
              <label for="imageUrl">Image URL:</label>
              <input type="url" name="imageUrl" class="url-input" bind:value={url} />
            </div>
          </div>

          <div class="d-flex justify-content-center align-items-center">
            <button class="btn confirm text-white p-2 w-50" type="submit">Confirm</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .tag-list-container {
    height: 30px;
  }
  .main-card {
    background-color: #1ca496;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
  }

  .confirm {
    background-color: #309329;
  }

  .tag-button {
    background-color: #172740;
    font-size: 0.85rem;
  }

  .or-separator {
    color: #e5e0e0;
  }

  .tag-toggle {
    background-color: rgb(207, 59, 59);
    border-radius: 10px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .content {
    flex: 1;
    padding: 0px 0rem 0px 2rem;
    margin-left: 14vw;
    width: 75vw;
  }

  .normal-input {
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }
  .url-input {
    border: 1px solid #ccc;
    border-radius: 0.3rem;
    padding: 0.5rem;
  }

  .btn:hover {
    transform: scale(1.05);
  }

  @media screen and (max-width: 1100px) {
    .upload-options {
      flex-direction: column;
      gap: 15px;
    }
  }
</style>

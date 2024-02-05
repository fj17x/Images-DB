<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
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

<div class="container">
  <Dashboard />
  <div class="content">
    <h3>Upload an Image:</h3>

    <div class="main-card">
      <form class="card-form" on:submit|preventDefault={handleUpload}>
        <span>
          <label for="title">Title*:</label>
          <br />
          <input type="text" name="title" class="normal-input" bind:value={title} required /></span
        >
        <span>
          <label for="title">Description:</label>
          <br />
          <textarea rows="6" cols="35" class="normal-input" bind:value={description} name="description" /></span
        >
        <span>
          <label for="title">Tags:</label>
          <br />
          <input type="text" name="tag" class="normal-input" bind:value={toAddTag} id="tag" />
          <button class="submit-button tag-button" type="button" on:click={addTag}>Add tag</button>
          <br />
          {#each tags as tag}
            <span class="tag-container">
              <button type="button" class="tag-toggle" on:click={() => removeTag(tag)}>
                {tag}
                <span class="remove-tag">
                  <i class="fa fa-times"></i>
                </span>
              </button>
              &nbsp;
            </span>
          {/each}
          <br />
        </span>
        <br />
        <div class="upload-options">
          <div class="file-div">
            <label for="file">Upload File:</label>
            <input class="file-input" type="file" name="file" bind:value={uploadedFile} />
          </div>
          <div class="or-separator">OR</div>
          <div class="url-div">
            <label for="imageUrl">Image URL:</label>
            <input type="url" name="imageUrl" class="url-input" bind:value={url} />
          </div>
        </div>
        <br />

        <div class="confirm-div">
          <button class="submit-button confirm" type="submit">Confirm</button>
        </div>
      </form>
    </div>
  </div>
</div>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .upload-options {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 10px;
    gap: 15px;
  }

  .confirm-div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .confirm {
    background-color: #309329;
    border-radius: 0.3rem;
    font-size: 0.85rem;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
    width: 50%;
  }

  .tag-button {
    background-color: #172740;
    border-radius: 0.3rem;
    font-size: 0.85rem;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
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
  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0px 2rem;
    margin-left: 14vw;
    width: 75vw;
  }

  .main-card {
    background-color: #1ca496;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .card-form {
    display: flex;
    justify-content: center;
    align-items: space-between;
    flex-direction: column;
    color: white;
  }

  .normal-input {
    margin-bottom: 1rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }
  .url-input,
  .file-input {
    border: 1px solid #ccc;
    border-radius: 0.3rem;
    padding: 0.5rem;
  }

  .submit-button:hover {
    transform: scale(1.05);
  }

  textarea {
    margin-bottom: 1rem;
    padding: 0.5rem;
    max-width: 800px;
    min-width: 150px;
    max-height: 300px;
    max-height: 300px;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }

  @media screen and (max-width: 800px) {
    .upload-options {
      flex-direction: column;
      gap: 15px;
    }
  }
</style>

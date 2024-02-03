<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
  import ImageModal from "$lib/components/ImageModal.svelte"
  import ImagesModal from "$lib/components/ImagesModal.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"

  let tags = []
  let showModal = false
  let showAdvancedModal = false

  let showAlertModal = false
  let alertModalOptions = {}
  let imageData = {}
  let images = []

  let toAddTag

  let idForSimple
  let limit = 10
  let offset = 0
  let sortOrder
  let sortBy

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

  const removeTag = (event) => {
    const toRemoveTag = event.target.innerText
    tags = tags.filter((tag) => tag !== toRemoveTag)
  }

  const handleSubmitSingle = async () => {
    const searchId = idForSimple
    const response = await fetch(`http://localhost:4000/images/${searchId}`, {
      method: "GET",
      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      imageData = {
        url: reply.data.url,
        title: reply.data.title,
        id: reply.data.id,
      }
      showModal = true
    } else {
      alertModalOptions.header = "Search failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const handleSubmitAdvanced = async (event) => {
    const params = new URLSearchParams()
    params.append("limit", limit)
    params.append("offset", offset)
    params.append("sortOrder", sortOrder)
    params.append("sortBy", sortBy)
    if (tags.length > 0) {
      const tagsWithCommas = tags.join(",")
      params.append("tags", tagsWithCommas)
    }

    console.log(params.toString())

    const response = await fetch(`http://localhost:4000/images?${params.toString()}`, {
      method: "GET",

      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      images = reply.data
      showAdvancedModal = true
    } else {
      alertModalOptions.header = "Search failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }
</script>

<div class="container">
  <Dashboard />
  <div class="contents">
    <div class="content">
      <h3>Search for an image using ID:</h3>

      <div class="main-card">
        <form class="card-form" on:submit|preventDefault={handleSubmitSingle}>
          <span class="input-normal">
            <span>
              <label for="id">Image ID*:</label>
              <input type="number" name="id" bind:value={idForSimple} required />
            </span>
            <button class="submit-button" type="submit">Confirm</button>
          </span>
        </form>
      </div>
    </div>
    <div class="content">
      <h3>Advanced search:</h3>
      <div class="main-card">
        <form on:submit|preventDefault={handleSubmitAdvanced}>
          <div class="grid">
            <div class="grid-item">
              <label for="limit">Limit:</label>
              <br />
              <input type="number" name="limit" bind:value={limit} required />
            </div>
            <div class="grid-item">
              <label for="sortby">Sort By:</label>
              <br />
              <select name="sortby" id="sortby" bind:value={sortBy}>
                <option value="id">id</option>
                <option value="url">url</option>
                <option value="description">description</option>
                <option value="createdAt">createdAt</option>
                <option value="modifiedAt">modifiedAt</option>
              </select>
            </div>
            <div class="grid-item">
              <label for="offset">Offset:</label>
              <br />
              <input type="number" name="offset" bind:value={offset} required />
            </div>
            <div class="grid-item">
              <label for="sortorder">Sort Order:</label>
              <br />
              <select name="sortorder" id="sortorder" bind:value={sortOrder}>
                <option value="ASC">ASC</option>
                <option value="DESC">DESC</option>
              </select>
            </div>
            <div class="grid-item">
              <label for="tag">Tags:</label>
              <br />

              <input type="text" name="tag" id="tag" bind:value={toAddTag} />
              <br />
              {#each tags as tag}
                <button type="button" on:click={removeTag}>{tag}<i class="fa fa-times"></i> </button>
              {/each}
              <br />
              <br />
              <button class="submit-button" type="button" on:click={addTag}>Add tag</button>
            </div>
            <div class="grid-item">
              <button class="submit-button" type="submit">Confirm</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

{#if showModal}
  <ImageModal bind:showModal {...imageData}></ImageModal>
{/if}
{#if showAdvancedModal}
  <ImagesModal bind:showModal={showAdvancedModal} {images}></ImagesModal>
{/if}
{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0px 2rem;
    margin-left: 14vw;
    width: 75vw;
  }

  .contents {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .input-normal {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .main-card {
    background-color: #1ca496;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem 2rem 1rem 2rem;
  }

  .card-form {
    display: flex;
    justify-content: center;
    align-items: space-between;
    flex-direction: column;
    color: white;
    padding: 0 2.5rem;
  }

  .grid {
    display: grid;
    color: white;
    grid-template-columns: repeat(2, 1fr);
    place-items: center;
    text-align: center;
  }

  .grid-item {
    margin-bottom: 1rem;
    width: 100%;
  }

  .input-normal input {
    width: 50%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }
  .grid-item input {
    width: 50%;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }

  .submit-button {
    background-color: #172740;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
  }
</style>

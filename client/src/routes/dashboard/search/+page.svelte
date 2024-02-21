<script>
  import Sidebar from "$lib/components/Sidebar.svelte"
  import ImageModal from "$lib/components/ImageModal.svelte"
  import ImagesModal from "$lib/components/ImagesModal.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"

  let tags = []
  let showSimpleModal = false
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

  const removeTag = (toRemoveTag) => {
    tags = tags.filter((tag) => tag !== toRemoveTag)
  }

  const handleSearchSingle = async () => {
    const searchId = idForSimple
    const response = await fetch(`http://localhost:4000/v1/images/${searchId}`, {
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
      showSimpleModal = true
    } else {
      alertModalOptions.header = "Search failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const handleSearchAdvanced = async () => {
    const params = new URLSearchParams()
    params.append("limit", limit)
    params.append("offset", offset)
    params.append("sortOrder", sortOrder)
    params.append("sortBy", sortBy)

    if (tags.length > 0) {
      const tagsWithCommas = tags.join(",")
      params.append("tags", tagsWithCommas)
    }

    const response = await fetch(`http://localhost:4000/v1/images?${params.toString()}`, {
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

<div class="container-fluid p-0 m-0">
  <Sidebar />
  <div class="d-flex align-items-center flex-column pt-2">
    <div class="container content my-3">
      <h4>Search for an image using ID:</h4>

      <div class="main-card">
        <form
          class="card-form d-flex justify-content-center align-items-between flex-column text-white"
          on:submit|preventDefault={handleSearchSingle}
        >
          <span class="d-flex justify-content-evenly align-items-center">
            <div>
              <label for="id">Image ID*:</label>
              <!-- svelte-ignore a11y-autofocus -->
              <input autofocus type="number" class="form-control" name="id" bind:value={idForSimple} required />
            </div>
            <div>
              <button class="btn text-white confirm-button" type="submit">Search</button>
            </div>
          </span>
        </form>
      </div>
    </div>
    <div class="container content">
      <h4>Advanced search:</h4>
      <div class="card main-card text-white">
        <form on:submit|preventDefault={handleSearchAdvanced}>
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="form-group">
                <label for="limit">Limit:</label>
                <input type="number" class="form-control" id="limit" name="limit" bind:value={limit} min="1" required />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="sortby">Sort By:</label>
                <select class="form-select" id="sortby" name="sortby" bind:value={sortBy}>
                  <option value="id">id</option>
                  <option value="url">url</option>
                  <option value="description">description</option>
                  <option value="createdAt">createdAt</option>
                  <option value="updatedAt">updatedAt</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6">
              <div class="form-group">
                <label for="offset">Offset:</label>
                <input type="number" class="form-control" id="offset" name="offset" min="0" bind:value={offset} required />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="sortorder">Sort Order:</label>
                <select class="form-select" id="sortorder" name="sortorder" bind:value={sortOrder}>
                  <option value="ASC">ASC</option>
                  <option value="DESC">DESC</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6">
              <div class="form-group">
                <label for="tag">Tags:</label>
                <div class="input-group gap-2">
                  <input type="text" class="form-control" id="tag" name="tag" bind:value={toAddTag} />
                  <button type="button" class="btn tag-button text-white" on:click={addTag}>Add</button>
                </div>
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
              </div>
            </div>

            <div class="row">
              <div class="col-sm-9"></div>
              <div class="col-sm-3">
                <button class="btn confirm-button text-white" type="submit">Search</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

{#if showSimpleModal}
  <ImageModal bind:showModal={showSimpleModal} {...imageData}></ImageModal>
{/if}
{#if showAdvancedModal}
  <ImagesModal bind:showModal={showAdvancedModal} {images}></ImagesModal>
{/if}
{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .tag-list-container {
    height: 40px;
  }

  .tag-toggle {
    background-color: rgb(207, 59, 59);
    border-radius: 10px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  #sortby,
  #sortorder {
    border: 1px solid #999;
    border-radius: 0.5rem;
    cursor: pointer;
    background-color: #f5f5f5;
    color: #333;
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
    padding: 2rem 2rem 1.8rem 2rem;
  }

  .tag-button {
    background-color: #172740;
    border-radius: 0.3rem;
  }

  .tag-button:hover {
    transform: scale(1.05);
  }
  .confirm-button {
    background-color: #309329;
  }

  .confirm-button:hover {
    transform: scale(1.05);
  }
</style>

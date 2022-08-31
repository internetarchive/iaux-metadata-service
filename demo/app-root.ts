import {
  css,
  CSSResult,
  customElement,
  html,
  internalProperty,
  LitElement,
  query,
  TemplateResult,
} from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { nothing } from 'lit-html';
import { MetadataResponse } from '../src/responses/metadata-response';
import { MetadataServiceInterface } from '../src/metadata-service-interface';
import { MetadataService } from '../src/metadata-service';

@customElement('app-root')
export class AppRoot extends LitElement {
  private metadataService: MetadataServiceInterface = MetadataService.default;

  @query('#metadata-input')
  private metadataInput!: HTMLInputElement;

  @internalProperty()
  private metadataResponse?: MetadataResponse;

  /** @inheritdoc */
  render(): TemplateResult {
    return html`
      <fieldset>
        <legend>Metadata Fetch</legend>
        <form>
          <label>Metadata</label>
          <input type="text" id="metadata-input" placeholder="Identifier" />
          <input
            type="submit"
            value="Get Metadata"
            @click=${this.getMetadata}
          />
        </form>
      </fieldset>

      ${this.metadataResponse ? this.metadataTemplate : nothing}
    `;
  }

  private get metadataTemplate(): TemplateResult {
    const rawMetadata = this.metadataResponse?.metadata.rawMetadata;
    if (!rawMetadata) return html`${nothing}`;

    return html`
      <h2>Metadata Response</h2>
      <table>
        ${Object.keys(rawMetadata).map(
          key => html`
            <tr>
              <td>${key}</td>
              <td>${unsafeHTML(rawMetadata[key])}</td>
            </tr>
          `
        )}
      </table>
    `;
  }

  async getMetadata(e: Event): Promise<void> {
    e.preventDefault();
    const identifier = this.metadataInput.value;
    const result = await this.metadataService.fetchMetadata(identifier);
    this.metadataResponse = result?.success;
  }

  static get styles(): CSSResult {
    return css`
      /* th {
        font-weight: bold;
      } */
    `;
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UtilService } from '../../../shared/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class FileService extends UtilService {

  //region fields

  /** File API route URL. */
  protected readonly apiUrl = `${environment.apiUrl}/file`;

  //endregion

  //region methods

  /**
   * Upload a file (profile picture or banner).
   * @param file The file to upload.
   * @param fileType The type of file ('profile_picture' or 'banner').
   * @returns The server response.
   */
  public async uploadFile(file: File, fileType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    return this.tryPostAsync(this.apiUrl, formData);
  }

  /**
   * Update an existing file.
   * @param fileId The ID of the file to update.
   * @param file The new file.
   * @returns The server response.
   */
  public async updateFile(fileId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.tryPostAsync(`${this.apiUrl}/${fileId}`, formData);
  }

  /**
   * Delete a file.
   * @param fileId The ID of the file to delete.
   * @returns The server response.
   */
  public async deleteFile(fileId: number): Promise<any> {
    return this.tryDeleteAsync(`${this.apiUrl}/${fileId}`);
  }

  //endregion

}